import { WEB_PUSH_SW_PATH, WEB_PUSH_SW_SCOPE } from "@/config/push/web-push.constant";
import type { WebPushConfig } from "@/types/push/web-push-config.type";

/**
 * The only file that touches Firebase. It is imported on demand (turning push on or off), so the Firebase
 * code never loads for a person who does not use browser push. Nothing here runs without a full `WebPushConfig`.
 */
async function messagingFor(config: WebPushConfig) {
  const [{ getApp, getApps, initializeApp }, { getMessaging, isSupported }] = await Promise.all([import("firebase/app"), import("firebase/messaging")]);
  if (!(await isSupported())) return null;
  const app = getApps().length > 0 ? getApp() : initializeApp(config.firebase);
  return getMessaging(app);
}

/** Registers the worker and returns this browser's FCM token, or null when the browser cannot do FCM web push. */
export async function requestPushToken(config: WebPushConfig): Promise<string | null> {
  const messaging = await messagingFor(config);
  if (!messaging) return null;
  const registration = await navigator.serviceWorker.register(WEB_PUSH_SW_PATH, { scope: WEB_PUSH_SW_SCOPE });
  await navigator.serviceWorker.ready;
  const { getToken } = await import("firebase/messaging");
  const token = await getToken(messaging, { vapidKey: config.vapidKey, serviceWorkerRegistration: registration });
  return token.length > 0 ? token : null;
}

/** Drops this browser's FCM registration; failures are ignored because the backend already revoked the token. */
export async function dropPushToken(config: WebPushConfig): Promise<void> {
  try {
    const messaging = await messagingFor(config);
    if (!messaging) return;
    const { deleteToken } = await import("firebase/messaging");
    await deleteToken(messaging);
  } catch {
    // The token is already revoked server-side; nothing else to undo.
  }
}
