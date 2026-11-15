import { notFound } from "next/navigation";

import type { AuthActor } from "@/enums/access/auth-actor.enum";
import { authActorSchema } from "@/schemas/core/session/auth-actor.zod";

export function parseGuardOrNotFound(value: string): AuthActor {
  const guard = authActorSchema.safeParse(value);
  if (!guard.success) notFound();
  return guard.data;
}
