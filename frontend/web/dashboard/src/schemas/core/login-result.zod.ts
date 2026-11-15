import { z } from "zod";

import { authActorSchema } from "@/schemas/core/auth-actor.zod";

export const loginResultSchema = z.object({ actor: authActorSchema });
