import { z } from "zod";

import { authActorSchema } from "@/schemas/core/auth-actor.zod";

export const MAX_PASSWORD_LENGTH = 255;

export const loginBodySchema = z.object({
  actor: authActorSchema,
  email: z.email(),
  password: z.string().min(1).max(MAX_PASSWORD_LENGTH),
});
