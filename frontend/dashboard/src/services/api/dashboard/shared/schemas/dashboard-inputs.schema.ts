import { z } from "zod";

export const DashboardListParamsSchema = z.object({
  page: z.number().optional(),
  perPage: z.number().optional(),
  search: z.string().optional(),
  status: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  chairId: z.string().optional(),
  stylistId: z.string().optional(),
});
