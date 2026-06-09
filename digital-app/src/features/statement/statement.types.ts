export type StatementFormat = "pdf" | "csv";

export interface StatementFormData {
  fromDate: string;
  toDate: string;
  format: StatementFormat;
}
