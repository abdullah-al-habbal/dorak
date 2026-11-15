import { z } from "zod";

export const emailChangeResultSchema = z.object({ pending_email: z.string(), expires_at: z.string() });
