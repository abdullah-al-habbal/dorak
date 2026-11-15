import { DEFAULT_KEY_ID, BACKEND_DEFAULT_URL } from "@/config/backend.constant";
import { sessionKeyRingSchema } from "@/schemas/session-keys.zod";
import type { SessionKeyRing } from "@/types/core/session-key-ring.type";

export function readBackendUrl(): string {
  const url = process.env.BACKEND_API_URL?.trim();
  return (url && url.length > 0 ? url : BACKEND_DEFAULT_URL).replace(/\/+$/, "");
}

export function readKeyRing(): SessionKeyRing | null {
  const raw = process.env.DASHBOARD_SESSION_SECRETS;
  if (raw) {
    try {
      const parsed = sessionKeyRingSchema.safeParse(JSON.parse(raw));
      if (parsed.success) return parsed.data;
    } catch {
      return null;
    }
    return null;
  }
  const single = sessionKeyRingSchema.safeParse({
    [DEFAULT_KEY_ID]: process.env.DASHBOARD_SESSION_SECRET ?? "",
  });
  return single.success ? single.data : null;
}
