import { downloadStatementApi } from "./statement.api";
import type { StatementFormData } from "./statement.types";

export const downloadStatementService = async (params: StatementFormData): Promise<Blob> => {
  const response = await downloadStatementApi(params);
  return response.data;
};
