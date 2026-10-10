import { beforeEach, describe, expect, it, vi } from "vitest";

const { backendRequest } = vi.hoisted(() => ({ backendRequest: vi.fn() }));

vi.mock("@/services/api/auth/backend-client", () => ({ backendRequest }));

import { GET } from "@/app/api/health/route";

beforeEach(() => backendRequest.mockReset());

describe("GET /api/health", () => {
  it("reports a public upstream 2xx response as available", async () => {
    backendRequest.mockResolvedValue({ status: 204, failure: "invalid-response" });

    const response = await GET();

    expect(backendRequest).toHaveBeenCalledWith("/api/v1/health");
    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    await expect(response.json()).resolves.toMatchObject({ success: true, data: { backend: "available" } });
  });

  it.each([302, 401, 403, 404])("does not misreport upstream %i as an outage", async (status) => {
    backendRequest.mockResolvedValue({ status, failure: status === 302 ? "redirect" : "none" });

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      data: { backend: "degraded", status },
    });
  });

  it.each([0, 500, 503])("reports upstream %i as unavailable", async (status) => {
    backendRequest.mockResolvedValue({ status, failure: status === 0 ? "transport" : "none" });

    const response = await GET();

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: { code: "backend_unavailable" },
    });
  });
});
