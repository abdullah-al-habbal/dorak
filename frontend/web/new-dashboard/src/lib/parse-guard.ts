import { notFound } from "next/navigation";

import type { AuthActor } from "@/enums/auth-actor.enum";
import { authActorSchema } from "@/schemas/auth-actor.zod";

export function parseGuardOrNotFound(value: string): AuthActor {
  const guard = authActorSchema.safeParse(value);
  if (!guard.success) notFound();
  return guard.data;
}
