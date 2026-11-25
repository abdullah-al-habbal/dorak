interface BrowserLike {
  navigator: { serviceWorker?: unknown };
  PushManager?: unknown;
  Notification?: unknown;
}

/** True when the browser has service workers, the Push API and notifications (Safari on iOS only inside an installed web app). */
export function isWebPushSupported(browser: BrowserLike): boolean {
  return Boolean(browser.navigator.serviceWorker) && Boolean(browser.PushManager) && Boolean(browser.Notification);
}
