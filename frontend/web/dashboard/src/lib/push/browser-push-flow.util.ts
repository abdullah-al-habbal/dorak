import type { Locale } from "@/enums/access/locale.enum";
import { dropPushToken, requestPushToken } from "@/lib/push/firebase-web-push.util";
import { isWebPushSupported } from "@/lib/push/web-push-support.util";
import { browserStorage, clearStoredPushRegistration, readStoredPushRegistration, storePushRegistration } from "@/lib/push/web-push-token-storage.util";
import { registerPushToken, revokePushToken } from "@/services/api/mutation/push/push-token.mutation";
import type { BrowserPushStatus } from "@/types/push/browser-push-status.type";
import type { WebPushConfig } from "@/types/push/web-push-config.type";
import type { MeProfile } from "@/types/account/profile/me-profile.type";

interface TurnOnInput {
  config: WebPushConfig;
  locale: Locale;
  owner: string;
}

/** Identifies the signed-in account, so one account never reads another's registration as its own. */
export function pushOwnerKey(profile: Pick<MeProfile, "actor_type" | "id">): string {
  return `${profile.actor_type}:${profile.id}`;
}

/** Reads the browser. "on" needs permission and a registration made by this same account. */
export function detectBrowserPushStatus(hasConfig: boolean, owner: string | null): BrowserPushStatus {
  if (!hasConfig) return "unconfigured";
  if (!isWebPushSupported(window)) return "unsupported";
  if (Notification.permission === "denied") return "denied";
  const storage = browserStorage();
  const stored = storage ? readStoredPushRegistration(storage) : null;
  return Notification.permission === "granted" && stored !== null && stored.owner === owner ? "on" : "off";
}

/** Asks for permission, then registers this browser for the account. Throws when Firebase or the backend fails. */
export async function turnOnBrowserPush({ config, locale, owner }: TurnOnInput): Promise<BrowserPushStatus> {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return permission === "denied" ? "denied" : "off";
  const token = await requestPushToken(config);
  if (!token) return "unsupported";
  await registerPushToken({ token, locale });
  const storage = browserStorage();
  if (storage) storePushRegistration(storage, { token, owner });
  return "on";
}

/** Revokes on the backend first, so a failure keeps the stored token for another try. */
export async function turnOffBrowserPush(config: WebPushConfig): Promise<BrowserPushStatus> {
  const storage = browserStorage();
  const stored = storage ? readStoredPushRegistration(storage) : null;
  if (stored) await revokePushToken(stored.token);
  if (storage) clearStoredPushRegistration(storage);
  await dropPushToken(config);
  return "off";
}
