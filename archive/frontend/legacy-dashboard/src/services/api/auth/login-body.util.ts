import { AUTH_ACTORS } from "@/services/api/auth/actors.constant";
import type { LoginCredentials } from "@/services/api/auth/types/auth.types";
import { isOneOf, isRecord } from "@/utils/guards.util";

/** Narrow an untrusted BFF login payload to typed credentials, or null when malformed. */
export function parseLoginBody(value: unknown): LoginCredentials | null {
  if (!isRecord(value)) {
    return null;
  }

  const { actor, email, password } = value;
  if (
    !isOneOf(AUTH_ACTORS, actor) ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    return null;
  }

  return { actor, email, password };
}
