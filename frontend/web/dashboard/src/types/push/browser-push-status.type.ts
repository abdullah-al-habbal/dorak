/** `checking` is the first render, before the browser has been asked; `unconfigured` means the public Firebase values are not set. */
export type BrowserPushStatus = "checking" | "unconfigured" | "unsupported" | "denied" | "off" | "on";
