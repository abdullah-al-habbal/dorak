import { beforeEach, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { backendRequest, readSessionCookies } = vi.hoisted(() => ({
  backendRequest: vi.fn(),
  readSessionCookies: vi.fn(),
}));
vi.mock("@/services/api/auth/backend-client", () => ({ backendRequest }));
vi.mock("@/services/api/auth/cookies", () => ({ readSessionCookies }));
import { GET, PATCH } from "@/app/api/dashboard/[...path]/route";

beforeEach(() => {
  backendRequest.mockReset();
  readSessionCookies.mockReturnValue({ accessToken: "dashboard-token" });
});

it("proxies an allowed dashboard resource with the session bearer token", async () => {
  backendRequest.mockResolvedValue({
    ok: true,
    status: 200,
    envelope: { data: [{ id: "branch-1" }], meta: { current_page: 1 } },
  });
  const request = new NextRequest(
    "http://localhost/api/dashboard/branches?page=1",
  );

  const response = await GET(request, {
    params: Promise.resolve({ path: ["branches"] }),
  });

  expect(backendRequest).toHaveBeenCalledWith(
    "/api/v1/dashboard/branches?page=1",
    expect.objectContaining({ method: "GET" }),
  );
  await expect(response.json()).resolves.toMatchObject({
    success: true,
    data: { items: [{ id: "branch-1" }] },
  });
});

it("converts settings request and response bodies between camelCase and snake_case", async () => {
  backendRequest.mockResolvedValue({
    ok: true,
    status: 200,
    envelope: {
      data: { preferred_language: "ar", allows_notifications: true },
    },
  });
  const request = new NextRequest("http://localhost/api/dashboard/settings", {
    method: "PATCH",
    body: JSON.stringify({ preferredLanguage: "ar" }),
  });

  const response = await PATCH(request, {
    params: Promise.resolve({ path: ["settings"] }),
  });

  expect(backendRequest).toHaveBeenCalledWith(
    "/api/v1/dashboard/settings",
    expect.objectContaining({
      method: "PATCH",
      body: JSON.stringify({ preferred_language: "ar" }),
    }),
  );
  await expect(response.json()).resolves.toMatchObject({
    success: true,
    data: { preferredLanguage: "ar", allowsNotifications: true },
  });
});

it("rejects a disallowed method and path without calling the backend", async () => {
  const response = await PATCH(
    new NextRequest("http://localhost/api/dashboard/branches/branch-1", {
      method: "PATCH",
    }),
    { params: Promise.resolve({ path: ["branches", "branch-1"] }) },
  );

  expect(response.status).toBe(404);
  expect(backendRequest).not.toHaveBeenCalled();
});
