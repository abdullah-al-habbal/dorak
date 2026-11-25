import { describe, expect, it } from "vitest";

import { WEB_PUSH_TOKEN_STORAGE_KEY } from "@/config/push/web-push.constant";
import { clearStoredPushRegistration, readStoredPushRegistration, storePushRegistration } from "@/lib/push/web-push-token-storage.util";

function memoryStorage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => void values.delete(key),
    setItem: (key, value) => void values.set(key, value),
  };
}

const BLOCKED: Storage = {
  length: 0,
  clear: () => undefined,
  key: () => null,
  getItem: () => {
    throw new Error("blocked");
  },
  setItem: () => {
    throw new Error("blocked");
  },
  removeItem: () => {
    throw new Error("blocked");
  },
};

describe("push registration storage", () => {
  const registration = { token: "token-1", owner: "barber:7" };

  it("stores, reads and clears the registration", () => {
    const storage = memoryStorage();
    expect(readStoredPushRegistration(storage)).toBeNull();
    storePushRegistration(storage, registration);
    expect(readStoredPushRegistration(storage)).toEqual(registration);
    clearStoredPushRegistration(storage);
    expect(readStoredPushRegistration(storage)).toBeNull();
  });

  it.each(["token-1", "{}", JSON.stringify({ token: "token-1" }), JSON.stringify({ token: "", owner: "barber:7" })])(
    "ignores a malformed stored value %s",
    (value) => {
      const storage = memoryStorage();
      storage.setItem(WEB_PUSH_TOKEN_STORAGE_KEY, value);
      expect(readStoredPushRegistration(storage)).toBeNull();
    },
  );

  it("never throws when the browser blocks storage", () => {
    expect(readStoredPushRegistration(BLOCKED)).toBeNull();
    expect(() => storePushRegistration(BLOCKED, registration)).not.toThrow();
    expect(() => clearStoredPushRegistration(BLOCKED)).not.toThrow();
  });
});
