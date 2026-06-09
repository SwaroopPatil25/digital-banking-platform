import { describe, it, expect } from "@jest/globals";
import beneficiaryReducer, {
  setBeneficiaryFilters,
  clearBeneficiaryFilters,
  clearBeneficiaryError,
  fetchBeneficiaries,
  addBeneficiary,
} from "../../store/slices/beneficiarySlice";

describe("beneficiarySlice", () => {
  const initialState = {
    beneficiaries: [],
    selectedBeneficiary: null,
    filters: { search: "", bank: "", status: "" as const },
    loading: false,
    error: null,
    lastFetched: null,
  };

  it("should return initial state", () => {
    expect(beneficiaryReducer(undefined, { type: "unknown" })).toEqual(initialState);
  });

  it("should set filters", () => {
    const result = beneficiaryReducer(initialState, setBeneficiaryFilters({ search: "HDFC", bank: "HDFC Bank" }));
    expect(result.filters.search).toBe("HDFC");
    expect(result.filters.bank).toBe("HDFC Bank");
  });

  it("should clear filters", () => {
    const filteredState = { ...initialState, filters: { search: "test", bank: "SBI", status: "ACTIVE" as const } };
    const result = beneficiaryReducer(filteredState, clearBeneficiaryFilters());
    expect(result.filters).toEqual({ search: "", bank: "", status: "" });
  });

  it("should clear error", () => {
    const errorState = { ...initialState, error: "Some error" };
    const result = beneficiaryReducer(errorState, clearBeneficiaryError());
    expect(result.error).toBeNull();
  });

  it("should set loading on fetchBeneficiaries.pending", () => {
    const result = beneficiaryReducer(initialState, fetchBeneficiaries.pending("", undefined));
    expect(result.loading).toBe(true);
  });

  it("should populate beneficiaries on fetchBeneficiaries.fulfilled", () => {
    const beneficiaries = [
      { _id: "1", beneficiaryName: "John", accountNumber: "12345678", bankName: "HDFC", ifscCode: "HDFC0001234", createdAt: "2024-01-01", status: "ACTIVE" as const },
    ];
    const result = beneficiaryReducer(initialState, fetchBeneficiaries.fulfilled(beneficiaries, "", undefined));
    expect(result.beneficiaries).toHaveLength(1);
    expect(result.beneficiaries[0].beneficiaryName).toBe("John");
    expect(result.loading).toBe(false);
    expect(result.lastFetched).not.toBeNull();
  });

  it("should set error on fetchBeneficiaries.rejected", () => {
    const result = beneficiaryReducer(initialState, fetchBeneficiaries.rejected(null, "", undefined, "Failed to load beneficiaries"));
    expect(result.error).toBe("Failed to load beneficiaries");
    expect(result.loading).toBe(false);
  });

  it("should set error on addBeneficiary.rejected", () => {
    const result = beneficiaryReducer(initialState, addBeneficiary.rejected(null, "", { beneficiaryName: "", accountNumber: "", bankName: "", ifscCode: "" }, "Beneficiary already exists"));
    expect(result.error).toBe("Beneficiary already exists");
  });
});
