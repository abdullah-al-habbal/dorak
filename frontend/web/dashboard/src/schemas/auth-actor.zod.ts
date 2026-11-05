import { z } from "zod";

import { AuthActor } from "@/enums/auth-actor.enum";

export const authActorSchema = z.enum(AuthActor);
