import { z } from "zod";

import { authActorSchema } from "@/schemas/core/auth-actor.zod";
import { meProfileSchema } from "@/schemas/account/me-profile.zod";

export const sessionPayloadSchema = z.object({ actor: authActorSchema, profile: meProfileSchema });
