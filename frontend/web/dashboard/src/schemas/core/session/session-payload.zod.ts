import { z } from "zod";

import { authActorSchema } from "@/schemas/core/session/auth-actor.zod";
import { meProfileSchema } from "@/schemas/account/account/me-profile.zod";

export const sessionPayloadSchema = z.object({ actor: authActorSchema, profile: meProfileSchema });
