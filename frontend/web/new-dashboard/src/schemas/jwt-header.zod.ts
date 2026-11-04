import { z } from "zod";

export const jwtHeaderSchema = z.object({
  alg: z.literal("HS256"),
  typ: z.literal("JWT"),
  kid: z.string().min(1),
});
