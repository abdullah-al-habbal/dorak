import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { backendRequest, readSessionCookies } = vi.hoisted(() => ({
  backendRequest: vi.fn(),
  readSessionCookies: vi.fn(),
}));

vi.mock("@/services/api/auth/backend-client", () => ({ backendRequest }));
vi.mock("@/services/api/auth/cookies", () => ({ readSessionCookies }));

import { GET, PATCH, POST } from "@/app/api/notifications/[[...path]]/route";

const ID = "8f14e45f-ceea-467a-9f3b-1c2d3e4f5a6b";
const context = (path?: string[]) => ({ params: Promise.resolve({ path }) });
const backendNotification = {
  id: ID,
  type: "booking_update",
  title: "Booking updated",
  body: "Confirmed",
  data: { booking_id: "b-1" },
  read_at: null,
  created_at: "2026-10-22T10:00:00+00:00",
};

beforeEach(() => {
  backendRequest.mockReset();
  readSessionCookies.mockReturnValue({ accessToken: "session-token" });
});

describe("notifications BFF proxy", () => {
  it("lists the inbox and folds pagination and unread count into data", async () => {
    backendRequest.mockResolvedValue({
      ok: true,
      status: 200,
      envelope: {
        data: [backendNotification],
        meta: { pagination: { total: 7 }, unread_count: 3 },
      },
    });
    const request = new NextRequest(
      "http://localhost/api/notifications?per_page=20",
    );

    const response = await GET(request, context());

    expect(backendRequest).toHaveBeenCalledWith(
      "/api/v1/notifications?per_page=20",
      expect.objectContaining({ method: "GET" }),
    );
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      data: {
        unreadCount: 3,
        total: 7,
        items: [{ id: ID, readAt: null, data: { booking_id: "b-1" } }],
      },
    });
  });

  it("marks one notification read", async () => {
    backendRequest.mockResolvedValue({
      ok: true,
      status: 200,
      envelope: {
        data: { ...backendNotification, read_at: "2026-10-22T11:00:00+00:00" },
      },
    });
    const request = new NextRequest(
      `http://localhost/api/notifications/${ID}/read`,
      { method: "PATCH" },
    );

    const response = await PATCH(request, context([ID, "read"]));

    expect(backendRequest).toHaveBeenCalledWith(
      `/api/v1/notifications/${ID}/read`,
      expect.objectContaining({ method: "PATCH" }),
    );
    await expect(response.json()).resolves.toMatchObject({
      data: { id: ID, readAt: "2026-10-22T11:00:00+00:00" },
    });
  });

  it("marks all notifications read", async () => {
    backendRequest.mockResolvedValue({
      ok: true,
      status: 200,
      envelope: { data: { updated: 2, unread_count: 0 } },
    });
    const request = new NextRequest(
      "http://localhost/api/notifications/read-all",
      { method: "POST" },
    );

    const response = await POST(request, context(["read-all"]));

    expect(backendRequest).toHaveBeenCalledWith(
      "/api/v1/notifications/read-all",
      expect.objectContaining({ method: "POST" }),
    );
    await expect(response.json()).resolves.toMatchObject({
      data: { updated: 2, unreadCount: 0 },
    });
  });

  it.each([
    ["POST", [ID, "read"]],
    ["PATCH", ["not-a-uuid", "read"]],
    ["GET", ["..", "secrets"]],
  ])("rejects %s %j without calling the backend", async (method, path) => {
    const request = new NextRequest("http://localhost/api/notifications/x", {
      method,
    });
    const handler = method === "GET" ? GET : method === "POST" ? POST : PATCH;

    const response = await handler(request, context(path));

    expect(response.status).toBe(404);
    expect(backendRequest).not.toHaveBeenCalled();
  });

  it("returns 401 without a session and forwards backend 404s", async () => {
    readSessionCookies.mockReturnValueOnce({ accessToken: null });
    const unauthenticated = await GET(
      new NextRequest("http://localhost/api/notifications"),
      context(),
    );
    expect(unauthenticated.status).toBe(401);

    backendRequest.mockResolvedValue({
      ok: false,
      status: 404,
      envelope: { code: "RESOURCE_NOT_FOUND" },
    });
    const missing = await PATCH(
      new NextRequest(`http://localhost/api/notifications/${ID}/read`, {
        method: "PATCH",
      }),
      context([ID, "read"]),
    );
    expect(missing.status).toBe(404);
  });
});
