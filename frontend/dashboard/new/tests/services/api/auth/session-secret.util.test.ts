import { afterEach, describe, expect, it, vi } from "vitest";
import { getSessionSecret } from "@/services/api/auth/session-secret.util";

describe("getSessionSecret", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("reads the secret from the environment at call time", () => {
    vi.stubEnv("DASHBOARD_SESSION_SECRET", "configured-secret");
    expect(getSessionSecret()).toBe("configured-secret");
  });

  it("falls back to an empty secret so verification fails closed", () => {
    vi.stubEnv("DASHBOARD_SESSION_SECRET", undefined);
    expect(getSessionSecret()).toBe("");
  });
});
