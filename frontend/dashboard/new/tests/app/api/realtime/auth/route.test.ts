import { beforeEach, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { readSessionCookies } = vi.hoisted(() => ({ readSessionCookies: vi.fn() }));
vi.mock("@/services/api/auth/cookies", () => ({ readSessionCookies }));
import { POST } from "@/app/api/realtime/auth/route";

beforeEach(() => {
  readSessionCookies.mockReturnValue({ accessToken: "realtime-token" });
  vi.stubGlobal("fetch", vi.fn());
});

it("forwards private-channel authorization with the HttpOnly session token", async () => {
  vi.mocked(fetch).mockResolvedValue(new Response('{"auth":"signature"}', { status: 200 }));
  const response = await POST(new NextRequest("http://localhost/api/realtime/auth", { method: "POST", body: "socket_id=1&channel_name=private-branch.1" }));

  expect(fetch).toHaveBeenCalledWith("http://localhost:8000/api/v1/broadcasting/auth", expect.objectContaining({ method: "POST", headers: { Authorization: "Bearer realtime-token" } }));
  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toEqual({ auth: "signature" });
});
