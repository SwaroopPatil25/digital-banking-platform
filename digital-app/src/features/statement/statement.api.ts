import axiosInstance from "../../api/axios";
import type { AxiosResponse } from "axios";
import type { StatementFormData } from "./statement.types";

export const downloadStatementApi = (params: StatementFormData): Promise<AxiosResponse<Blob>> => {
  return axiosInstance.get("/statement/download", {
    params: {
      fromDate: params.fromDate,
      toDate: params.toDate,
      format: params.format,
    },
    responseType: "blob",
  });
};
