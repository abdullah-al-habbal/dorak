import { WEB_PUSH_TOKEN_STORAGE_KEY } from "@/config/push/web-push.constant";
import { storedPushRegistrationSchema } from "@/schemas/push/stored-push-registration.zod";
import type { StoredPushRegistration } from "@/types/push/stored-push-registration.type";

/** Storage can be missing or throw (private windows, blocked site data); push then simply reads as off. */
export function readStoredPushRegistration(storage: Pick<Storage, "getItem">): StoredPushRegistration | null {
  try {
    const value = storage.getItem(WEB_PUSH_TOKEN_STORAGE_KEY);
    if (!value) return null;
    const parsed = storedPushRegistrationSchema.safeParse(JSON.parse(value));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function storePushRegistration(storage: Pick<Storage, "setItem">, registration: StoredPushRegistration): void {
  try {
    storage.setItem(WEB_PUSH_TOKEN_STORAGE_KEY, JSON.stringify(registration));
  } catch {
    // Without storage the token cannot be revoked from this browser later; the backend revokes it on password change and ban.
  }
}

export function clearStoredPushRegistration(storage: Pick<Storage, "removeItem">): void {
  try {
    storage.removeItem(WEB_PUSH_TOKEN_STORAGE_KEY);
  } catch {
    // Nothing to clear.
  }
}

/** `window.localStorage` itself can throw (blocked site data), so reading the property is guarded too. */
export function browserStorage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}
