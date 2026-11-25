/** Static file in `public/`; it holds no configuration and no secrets. */
export const WEB_PUSH_SW_PATH = "/firebase-messaging-sw.js";
export const WEB_PUSH_SW_SCOPE = "/dashboard/";
/** The browser's own FCM token, kept so turning push off and signing out can revoke exactly this browser. */
export const WEB_PUSH_TOKEN_STORAGE_KEY = "dorak.dashboard.web-push-token";
export const WEB_PUSH_API = { token: "/push-token" } as const;
/** The backend accepts tokens up to this length. */
export const WEB_PUSH_TOKEN_MAX_LENGTH = 4096;
