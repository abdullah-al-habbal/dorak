import { describe, expect, it, vi } from "vitest";
import {
  reportSessionExpired,
  subscribeSessionExpiry,
} from "@/services/api/core/session-expiry";

describe("session expiry bus", () => {
  it("notifies subscribers until they unsubscribe", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeSessionExpiry(listener);

    reportSessionExpired();
    unsubscribe();
    reportSessionExpired();

    expect(listener).toHaveBeenCalledTimes(1);
  });
});
