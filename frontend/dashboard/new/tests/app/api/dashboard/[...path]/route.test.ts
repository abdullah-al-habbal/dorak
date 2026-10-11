import { beforeEach, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { backendRequest, readSessionCookies } = vi.hoisted(() => ({ backendRequest: vi.fn(), readSessionCookies: vi.fn() }));
vi.mock("@/services/api/auth/backend-client", () => ({ backendRequest }));
vi.mock("@/services/api/auth/cookies", () => ({ readSessionCookies }));
import { GET } from "@/app/api/dashboard/[...path]/route";

beforeEach(() => {
  backendRequest.mockReset();
  readSessionCookies.mockReturnValue({ accessToken: "dashboard-token" });
});

it("proxies an allowed dashboard resource with the session bearer token", async () => {
  backendRequest.mockResolvedValue({ ok: true, status: 200, envelope: { data: [{ id: "branch-1" }], meta: { current_page: 1 } } });
  const request = new NextRequest("http://localhost/api/dashboard/branches?page=1");

  const response = await GET(request, { params: Promise.resolve({ path: ["branches"] }) });

  expect(backendRequest).toHaveBeenCalledWith("/api/v1/dashboard/branches?page=1", expect.objectContaining({ method: "GET" }));
  await expect(response.json()).resolves.toMatchObject({ success: true, data: { items: [{ id: "branch-1" }] } });
});
