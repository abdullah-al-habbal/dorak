import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthEndpoints } from "@/services/api/auth/endpoints/auth.endpoints";
import { requestLogin, requestLogout } from "@/services/api/auth/auth.mutation";
import { api } from "@/services/api/client";

vi.mock("@/services/api/client", () => ({
  api: { post: vi.fn() },
}));

describe("auth requests", () => {
  beforeEach(() => vi.mocked(api.post).mockReset().mockResolvedValue({}));

  it("posts credentials to the BFF login route", async () => {
    const credentials = {
      actor: "admin" as const,
      email: "a@b.c",
      password: "secret",
    };
    await requestLogin(credentials);
    expect(api.post).toHaveBeenCalledWith(AuthEndpoints.login, credentials, {
      auth: "public",
    });
  });

  it("posts a session-scoped logout", async () => {
    await requestLogout();
    expect(api.post).toHaveBeenCalledWith(AuthEndpoints.logout);
  });
});
