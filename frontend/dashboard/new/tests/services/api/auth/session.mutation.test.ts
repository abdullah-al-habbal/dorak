import { beforeEach, describe, expect, it, vi } from "vitest";
import { ROUTES } from "@/config/routes.constant";
import { backendRequest } from "@/services/api/auth/backend-client";
import { refreshDashboardSession } from "@/services/api/auth/session.mutation";

vi.mock("@/services/api/auth/backend-client", () => ({ backendRequest: vi.fn() }));

describe("refreshDashboardSession", () => {
  beforeEach(() => vi.mocked(backendRequest).mockReset());

  it("posts the refresh token to the backend refresh endpoint", async () => {
    vi.mocked(backendRequest).mockResolvedValue({ ok: false, status: 401, envelope: null, failure: "none" });

    await refreshDashboardSession("refresh-token");

    expect(backendRequest).toHaveBeenCalledWith(ROUTES.api.dashboard.refresh, {
      method: "POST",
      body: JSON.stringify({ refresh_token: "refresh-token" }),
    });
  });

  it("fails closed when the backend rejects or is unreachable", async () => {
    vi.mocked(backendRequest).mockResolvedValue({ ok: false, status: 0, envelope: null, failure: "transport" });

    await expect(refreshDashboardSession("refresh-token")).resolves.toBeNull();
  });
});
