import type { WebPushConfig, WebPushEnv } from "@/types/push/web-push-config.type";

/** Next inlines `NEXT_PUBLIC_*` only when each one is written out in full, so they are listed here and nowhere else. */
export function readWebPushEnv(): WebPushEnv {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
  };
}

/** Browser push is on only when every value is set; one missing value means "not configured yet", never an error. */
export function parseWebPushConfig(env: WebPushEnv): WebPushConfig | null {
  const { apiKey, projectId, messagingSenderId, appId, vapidKey } = env;
  if (!apiKey || !projectId || !messagingSenderId || !appId || !vapidKey) return null;
  return { firebase: { apiKey, projectId, messagingSenderId, appId }, vapidKey };
}
