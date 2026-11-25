// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Locale } from "@/enums/access/locale.enum";
import { detectBrowserPushStatus, turnOffBrowserPush, turnOnBrowserPush } from "@/lib/push/browser-push-flow.util";
import { readStoredPushRegistration, storePushRegistration } from "@/lib/push/web-push-token-storage.util";
import { logoutMutation } from "@/services/api/mutation/core/logout.mutation";

const firebase = vi.hoisted(() => ({ requestPushToken: vi.fn(), dropPushToken: vi.fn() }));
const backend = vi.hoisted(() => ({ registerPushToken: vi.fn(), revokePushToken: vi.fn() }));
const client = vi.hoisted(() => ({ apiRequest: vi.fn() }));
vi.mock("@/lib/push/firebase-web-push.util", () => firebase);
vi.mock("@/services/api/mutation/push/push-token.mutation", () => backend);
vi.mock("@/services/api/core/client", () => client);

const config = { firebase: { apiKey: "k", projectId: "p", messagingSenderId: "1", appId: "a" }, vapidKey: "v" };
const input = { config, locale: Locale.En, owner: "barber:7" };

function stubBrowser(permission: NotificationPermission, answer: NotificationPermission = permission): void {
  vi.stubGlobal("Notification", { permission, requestPermission: vi.fn().mockResolvedValue(answer) });
  vi.stubGlobal("PushManager", class {});
  vi.stubGlobal("navigator", { serviceWorker: {} });
}

beforeEach(() => {
  vi.resetAllMocks();
  window.localStorage.clear();
  firebase.requestPushToken.mockResolvedValue("token-1");
});
afterEach(() => vi.unstubAllGlobals());

describe("detectBrowserPushStatus", () => {
  it("reads nothing from the browser when push is not configured", () => {
    expect(detectBrowserPushStatus(false, "barber:7")).toBe("unconfigured");
  });

  it("is on only for the account that registered this browser", () => {
    stubBrowser("granted");
    storePushRegistration(window.localStorage, { token: "token-1", owner: "barber:7" });
    expect(detectBrowserPushStatus(true, "barber:7")).toBe("on");
    expect(detectBrowserPushStatus(true, "manager:7")).toBe("off");
    expect(detectBrowserPushStatus(true, null)).toBe("off");
  });

  it("reports a blocked permission", () => {
    stubBrowser("denied");
    expect(detectBrowserPushStatus(true, "barber:7")).toBe("denied");
  });
});

describe("turnOnBrowserPush", () => {
  it.each([["denied", "denied"], ["default", "off"]] as const)("requests no token when permission is %s", async (answer, status) => {
    stubBrowser("default", answer);
    expect(await turnOnBrowserPush(input)).toBe(status);
    expect(firebase.requestPushToken).not.toHaveBeenCalled();
    expect(backend.registerPushToken).not.toHaveBeenCalled();
  });

  it("registers the token and remembers its owner", async () => {
    stubBrowser("default", "granted");
    expect(await turnOnBrowserPush(input)).toBe("on");
    expect(backend.registerPushToken).toHaveBeenCalledWith({ token: "token-1", locale: Locale.En });
    expect(readStoredPushRegistration(window.localStorage)).toEqual({ token: "token-1", owner: "barber:7" });
  });

  it("stores nothing when the backend refuses the token", async () => {
    stubBrowser("default", "granted");
    backend.registerPushToken.mockRejectedValue(new Error("403"));
    await expect(turnOnBrowserPush(input)).rejects.toThrow("403");
    expect(readStoredPushRegistration(window.localStorage)).toBeNull();
  });
});

describe("turnOffBrowserPush", () => {
  beforeEach(() => storePushRegistration(window.localStorage, { token: "token-1", owner: "barber:7" }));

  it("revokes, forgets and drops the registration", async () => {
    expect(await turnOffBrowserPush(config)).toBe("off");
    expect(backend.revokePushToken).toHaveBeenCalledWith("token-1");
    expect(firebase.dropPushToken).toHaveBeenCalledWith(config);
    expect(readStoredPushRegistration(window.localStorage)).toBeNull();
  });

  it("keeps the token when revoking fails", async () => {
    backend.revokePushToken.mockRejectedValue(new Error("network"));
    await expect(turnOffBrowserPush(config)).rejects.toThrow("network");
    expect(readStoredPushRegistration(window.localStorage)?.token).toBe("token-1");
  });
});

describe("logoutMutation", () => {
  beforeEach(() => storePushRegistration(window.localStorage, { token: "token-1", owner: "barber:7" }));

  it("sends the stored token and clears it after a successful sign-out", async () => {
    await logoutMutation();
    expect(client.apiRequest.mock.calls[0]?.[1]).toMatchObject({ body: { pushToken: "token-1" } });
    expect(readStoredPushRegistration(window.localStorage)).toBeNull();
  });

  it("keeps the token when sign-out fails", async () => {
    client.apiRequest.mockRejectedValue(new Error("network"));
    await expect(logoutMutation()).rejects.toThrow("network");
    expect(readStoredPushRegistration(window.localStorage)?.token).toBe("token-1");
  });
});
