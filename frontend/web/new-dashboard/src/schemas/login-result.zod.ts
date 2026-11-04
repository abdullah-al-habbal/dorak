import { z } from "zod";

import { authActorSchema } from "@/schemas/auth-actor.zod";

export const loginResultSchema = z.object({ actor: authActorSchema });
