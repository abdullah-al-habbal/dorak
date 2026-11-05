import { z } from "zod";

export const pageInfoSchema = z.object({
  total: z.number(),
  per_page: z.number(),
  current_page: z.number(),
  total_pages: z.number(),
});
