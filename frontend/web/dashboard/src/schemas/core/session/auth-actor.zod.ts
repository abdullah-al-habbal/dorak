import { z } from "zod";

import { AuthActor } from "@/enums/access/auth-actor.enum";

export const authActorSchema = z.enum(AuthActor);
