import { z } from "zod";

export const statementQuerySchema = z
  .object({
    fromDate: z.string().min(1, "fromDate is required").refine(
      (val) => !isNaN(Date.parse(val)),
      { message: "fromDate must be a valid date" }
    ),
    toDate: z.string().min(1, "toDate is required").refine(
      (val) => !isNaN(Date.parse(val)),
      { message: "toDate must be a valid date" }
    ),
    format: z.enum(["pdf", "csv"], {
      message: "Format must be pdf or csv",
    }),
  })
  .refine((data) => new Date(data.fromDate) <= new Date(data.toDate), {
    message: "fromDate must be before or equal to toDate",
    path: ["fromDate"],
  });

export type StatementQuery = z.infer<typeof statementQuerySchema>;
