export interface WebPushConfig {
  firebase: { apiKey: string; projectId: string; messagingSenderId: string; appId: string };
  vapidKey: string;
}

/** The public build-time values, each possibly missing. */
export interface WebPushEnv {
  apiKey?: string;
  projectId?: string;
  messagingSenderId?: string;
  appId?: string;
  vapidKey?: string;
}
