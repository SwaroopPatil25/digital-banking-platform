import PDFDocument from "pdfkit";
import { Parser } from "json2csv";
import { PassThrough } from "stream";
import Account from "../models/account.model.js";
import Transaction from "../models/transaction.model.js";
import User from "../models/user.model.js";
import StatementModel from "../models/statement.model.js";
import { StatementQuery } from "../validations/statement.validation.js";
import { buildPaginationResult, getSkip } from "../utils/pagination.js";
import { auditStatementDownload } from "./audit.service.js";

interface StatementData {
  customer: {
    customerId: string;
    accountNumber: string;
    accountType: string;
    username: string;
  };
  transactions: Array<{
    date: string;
    type: string;
    description: string;
    amount: string;
  }>;
  closingBalance: number;
  fromDate: string;
  toDate: string;
  transactionCount: number;
}

const generateStatementId = (): string => {
  const now = new Date();
  const dateStr = now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0");
  const random = Math.floor(10000 + Math.random() * 90000).toString();
  return `STMT${dateStr}${random}`;
};

const fetchStatementData = async (userId: string, query: StatementQuery): Promise<StatementData> => {
  const user = await User.findById(userId).select("customerId username");
  if (!user) throw new Error("User not found");

  const account = await Account.findOne({ userId });
  if (!account) throw new Error("Account not found");

  const from = new Date(query.fromDate);
  from.setHours(0, 0, 0, 0);
  const to = new Date(query.toDate);
  to.setHours(23, 59, 59, 999);

  const transactions = await Transaction.find({
    userId,
    transactionDate: { $gte: from, $lte: to },
  }).sort({ transactionDate: -1 });

  if (transactions.length === 0) throw new Error("No transactions found");

  const formattedTransactions = transactions.map((txn) => ({
    date: txn.transactionDate.toISOString().split("T")[0],
    type: txn.type.charAt(0).toUpperCase() + txn.type.slice(1).toLowerCase(),
    description: txn.description,
    amount: txn.type === "CREDIT" ? `+ RS. ${txn.amount}` : `- RS. ${txn.amount}`,
  }));

  return {
    customer: {
      customerId: user.customerId,
      accountNumber: account.accountNumber,
      accountType: account.accountType,
      username: user.username,
    },
    transactions: formattedTransactions,
    closingBalance: account.balance,
    fromDate: query.fromDate,
    toDate: query.toDate,
    transactionCount: transactions.length,
  };
};

const trackStatementGeneration = async (userId: string, query: StatementQuery, transactionCount: number) => {
  const statementId = generateStatementId();
  const fileName = `statement_${query.fromDate}_${query.toDate}.${query.format}`;

  await StatementModel.create({
    userId,
    statementId,
    fromDate: new Date(query.fromDate),
    toDate: new Date(query.toDate),
    format: query.format,
    transactionCount,
    fileName,
    status: "GENERATED",
    downloadCount: 1,
  });

  auditStatementDownload(userId, query.format, query.fromDate, query.toDate);

  return statementId;
};

export const generatePDF = async (userId: string, query: StatementQuery): Promise<PassThrough> => {
  const data = await fetchStatementData(userId, query);

  // Track generation
  await trackStatementGeneration(userId, query, data.transactionCount);

  const doc = new PDFDocument({ margin: 50 });
  const stream = new PassThrough();
  doc.pipe(stream);

  doc.fontSize(20).font("Helvetica-Bold").text("BFSI BANK", { align: "center" });
  doc.moveDown(0.3);
  doc.fontSize(10).font("Helvetica").text("Account Statement", { align: "center" });
  doc.moveDown(0.5);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(1);

  doc.fontSize(12).font("Helvetica-Bold").text("Customer Details");
  doc.moveDown(0.5);
  doc.fontSize(10).font("Helvetica");
  doc.text(`Customer Name: ${data.customer.username}`);
  doc.text(`Customer ID: ${data.customer.customerId}`);
  doc.text(`Account Number: ${data.customer.accountNumber}`);
  doc.text(`Account Type: ${data.customer.accountType}`);
  doc.moveDown(1);

  doc.fontSize(12).font("Helvetica-Bold").text("Statement Period");
  doc.moveDown(0.3);
  doc.fontSize(10).font("Helvetica");
  doc.text(`From: ${data.fromDate}`);
  doc.text(`To: ${data.toDate}`);
  doc.moveDown(1);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(1);

  doc.fontSize(10).font("Helvetica-Bold");
  const tableTop = doc.y;
  doc.text("Date", 50, tableTop, { width: 100 });
  doc.text("Type", 150, tableTop, { width: 80 });
  doc.text("Description", 230, tableTop, { width: 200 });
  doc.text("Amount", 430, tableTop, { width: 115, align: "right" });
  doc.moveDown(0.5);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(0.5);

  doc.font("Helvetica").fontSize(9);
  for (const txn of data.transactions) {
    if (doc.y > 700) doc.addPage();
    doc.text(txn.date, 50, doc.y, { width: 100 });
    const currentY = doc.y - 11;
    doc.text(txn.type, 150, currentY, { width: 80 });
    doc.text(txn.description, 230, currentY, { width: 200 });
    doc.text(txn.amount, 430, currentY, { width: 115, align: "right" });
    doc.moveDown(0.3);
  }

  doc.moveDown(1);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(0.5);
  doc.fontSize(11).font("Helvetica-Bold");
  doc.text(`Closing Balance: Rs. ${data.closingBalance.toLocaleString("en-IN")}`, { align: "right" });

  doc.moveDown(2);
  doc.fontSize(8).font("Helvetica").fillColor("gray");
  doc.text("This is a system-generated statement.", { align: "center" });

  doc.end();
  return stream;
};

export const generateCSV = async (userId: string, query: StatementQuery): Promise<string> => {
  const data = await fetchStatementData(userId, query);

  // Track generation
  await trackStatementGeneration(userId, query, data.transactionCount);

  const fields = [
    { label: "Date", value: "date" },
    { label: "Type", value: "type" },
    { label: "Description", value: "description" },
    { label: "Amount", value: "amount" },
  ];

  const parser = new Parser({ fields });
  return parser.parse(data.transactions);
};

export const getStatementHistory = async (userId: string, query: { page: number; limit: number }) => {
  const { page, limit } = query;
  const skip = getSkip(page, limit);

  const filter = { userId, isDeleted: { $ne: true } };

  const [statements, totalRecords] = await Promise.all([
    StatementModel.find(filter).sort({ generatedAt: -1 }).skip(skip).limit(limit),
    StatementModel.countDocuments(filter),
  ]);

  return {
    success: true,
    data: statements,
    pagination: buildPaginationResult(page, limit, totalRecords),
  };
};
