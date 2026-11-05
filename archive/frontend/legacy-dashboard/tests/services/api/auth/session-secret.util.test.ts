import { afterEach, describe, expect, it, vi } from "vitest";
import { getSessionSecrets } from "@/services/api/auth/session-secret.util";

describe("getSessionSecret", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("reads legacy and rotation secrets from the environment at call time", () => {
    vi.stubEnv(
      "DASHBOARD_SESSION_SECRET",
      "configured-dashboard-secret-at-least-32-characters",
    );
    vi.stubEnv(
      "DASHBOARD_SESSION_SECRETS",
      '{"previous":"a-previous-secret-with-more-than-32-characters"}',
    );
    expect(getSessionSecrets()).toEqual({
      default: "configured-dashboard-secret-at-least-32-characters",
      previous: "a-previous-secret-with-more-than-32-characters",
    });
  });

  it("falls back to an empty secret so verification fails closed", () => {
    vi.stubEnv("DASHBOARD_SESSION_SECRET", undefined);
    expect(getSessionSecrets()).toEqual({});
  });
});
