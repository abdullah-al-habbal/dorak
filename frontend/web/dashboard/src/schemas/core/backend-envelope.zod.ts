import { z } from "zod";

export const backendEnvelopeSchema = z.object({
  success: z.boolean(),
  statusCode: z.number(),
  code: z.string(),
  message: z.string(),
  timestamp: z.string(),
  request_id: z.string().optional(),
  data: z.unknown().optional(),
  meta: z.unknown().optional(),
  errors: z.record(z.string(), z.array(z.string())).optional(),
});
