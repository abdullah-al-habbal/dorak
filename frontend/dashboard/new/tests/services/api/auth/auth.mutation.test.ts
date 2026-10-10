import { beforeEach, describe, expect, it, vi } from "vitest";
import { ROUTES } from "@/config/routes.constant";
import { requestLogin, requestLogout } from "@/services/api/auth/auth.mutation";
import { apiRequest } from "@/services/api/client";

vi.mock("@/services/api/client", () => ({ apiRequest: vi.fn() }));

describe("auth requests", () => {
  beforeEach(() => vi.mocked(apiRequest).mockReset().mockResolvedValue({}));

  it("posts credentials to the BFF login route", async () => {
    const credentials = { actor: "admin" as const, email: "a@b.c", password: "secret" };
    await requestLogin(credentials);
    expect(apiRequest).toHaveBeenCalledWith(ROUTES.api.auth.login, {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  });

  it("posts a session-scoped logout", async () => {
    await requestLogout();
    expect(apiRequest).toHaveBeenCalledWith(ROUTES.api.auth.logout, { method: "POST", auth: "session" });
  });
});
