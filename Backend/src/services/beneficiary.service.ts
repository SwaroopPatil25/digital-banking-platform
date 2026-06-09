import Beneficiary from "../models/beneficiary.model.js";
import { BeneficiaryInput } from "../validations/beneficiary.validation.js";
import { buildPaginationResult, getSkip } from "../utils/pagination.js";
import { notifyBeneficiaryAdded } from "./notification-event.service.js";
import { auditBeneficiaryAdded, auditBeneficiaryRemoved } from "./audit.service.js";

interface BeneficiaryQuery {
  page: number;
  limit: number;
  search?: string;
  isFavorite?: string;
}

export const addBeneficiary = async (userId: string, data: BeneficiaryInput) => {
  const duplicate = await Beneficiary.findOne({
    userId,
    accountNumber: data.accountNumber,
    ifscCode: data.ifscCode,
    isDeleted: { $ne: true },
  });

  if (duplicate) {
    throw new Error("Beneficiary with same account number and IFSC already exists");
  }

  const beneficiary = await Beneficiary.create({
    userId,
    ...data,
    status: "active",
    beneficiaryStatus: "PENDING_APPROVAL",
  });

  // Non-blocking
  auditBeneficiaryAdded(userId, String(beneficiary._id), data.beneficiaryName);
  notifyBeneficiaryAdded(userId, data.beneficiaryName);

  return { success: true, message: "Beneficiary added successfully. Active after 30-minute cooling period." };
};

export const getBeneficiaries = async (userId: string, query: BeneficiaryQuery) => {
  const { page, limit, search, isFavorite } = query;

  const filter: Record<string, any> = { userId, isDeleted: { $ne: true } };

  if (search) {
    filter.$or = [
      { beneficiaryName: { $regex: search, $options: "i" } },
      { accountNumber: { $regex: search, $options: "i" } },
      { bankName: { $regex: search, $options: "i" } },
    ];
  }

  if (isFavorite === "true") {
    filter.isFavorite = true;
  }

  const skip = getSkip(page, limit);

  const [beneficiaries, totalRecords] = await Promise.all([
    Beneficiary.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Beneficiary.countDocuments(filter),
  ]);

  // Auto-activate beneficiaries past cooling period
  const COOLING_MS = 30 * 60 * 1000;
  const now = Date.now();
  for (const b of beneficiaries) {
    if (b.beneficiaryStatus === "PENDING_APPROVAL" && now - b.createdAt.getTime() >= COOLING_MS) {
      b.beneficiaryStatus = "ACTIVE";
      b.activatedAt = new Date();
      await b.save();
    }
  }

  const filtersApplied: Record<string, any> = {};
  if (search) filtersApplied.search = search;
  if (isFavorite) filtersApplied.isFavorite = isFavorite;

  return {
    success: true,
    data: beneficiaries,
    pagination: buildPaginationResult(page, limit, totalRecords),
    filtersApplied,
  };
};

export const deleteBeneficiary = async (userId: string, beneficiaryId: string) => {
  const beneficiary = await Beneficiary.findOne({ _id: beneficiaryId, userId, isDeleted: { $ne: true } });

  if (!beneficiary) {
    throw new Error("Beneficiary not found");
  }

  // Soft delete
  beneficiary.isDeleted = true;
  beneficiary.deletedAt = new Date();
  beneficiary.deletedBy = userId as any;
  await beneficiary.save();

  auditBeneficiaryRemoved(userId, beneficiaryId, beneficiary.beneficiaryName);

  return { success: true, message: "Beneficiary removed successfully" };
};
