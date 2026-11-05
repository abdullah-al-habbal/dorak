import { z } from "zod";

import { authActorSchema } from "@/schemas/auth-actor.zod";
import { meProfileSchema } from "@/schemas/me-profile.zod";

export const sessionPayloadSchema = z.object({ actor: authActorSchema, profile: meProfileSchema });
