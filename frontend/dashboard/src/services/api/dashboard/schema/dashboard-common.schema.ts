import { z } from "zod";

export const LocalizedNameSchema = z.object({
  ar: z.string(),
  en: z.string(),
});

export const DashboardEntityIdSchema = z.string();

export const DashboardPaginationSchema = z.object({
  page: z.number(),
  perPage: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

export const DashboardPageSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    pagination: DashboardPaginationSchema,
  });
