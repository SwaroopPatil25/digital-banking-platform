import Account from "../models/account.model.js";
import User from "../models/user.model.js";

const BRANCHES = [
  "Mumbai Main Branch",
  "Pune Branch",
  "Bangalore Branch",
  "Hyderabad Branch",
  "Delhi Branch",
  "Chennai Branch",
];

const BRANCH_IFSC_MAP: Record<string, string> = {
  "Mumbai Main Branch": "BFSI0001001",
  "Pune Branch": "BFSI0002001",
  "Bangalore Branch": "BFSI0003001",
  "Hyderabad Branch": "BFSI0004001",
  "Delhi Branch": "BFSI0005001",
  "Chennai Branch": "BFSI0006001",
};

export const generateBalance = (): number => {
  return Math.floor(5000 + Math.random() * 245000);
};

export const generateCreditScore = (): number => {
  // Weighted toward 700–850 for realism
  const base = 700;
  const range = 150;
  const skew = Math.random() * Math.random(); // skews toward lower end of random
  const score = base + Math.floor(skew * range);

  // 20% chance of being in 650–699 range
  if (Math.random() < 0.2) {
    return Math.floor(650 + Math.random() * 50);
  }

  // 10% chance of being in 850–900 range
  if (Math.random() < 0.1) {
    return Math.floor(850 + Math.random() * 50);
  }

  return score;
};

export const generateRewardPoints = (): number => {
  return Math.floor(Math.random() * 1001);
};

export const generateBranch = (): { branch: string; ifscCode: string } => {
  const branch = BRANCHES[Math.floor(Math.random() * BRANCHES.length)];
  const ifscCode = BRANCH_IFSC_MAP[branch];
  return { branch, ifscCode };
};

export const generateUniqueAccountNumber = async (): Promise<string> => {
  let accountNumber: string;
  let exists = true;

  do {
    const digits = Array.from({ length: 14 }, () => Math.floor(Math.random() * 10)).join("");
    accountNumber = digits;
    exists = !!(await Account.findOne({ accountNumber }));
  } while (exists);

  return accountNumber;
};

export const generateUniqueCustomerId = async (): Promise<string> => {
  let customerId: string;
  let exists = true;

  do {
    const digits = Math.floor(100000 + Math.random() * 900000).toString();
    customerId = `CUST${digits}`;
    exists = !!(await User.findOne({ customerId }));
  } while (exists);

  return customerId;
};
