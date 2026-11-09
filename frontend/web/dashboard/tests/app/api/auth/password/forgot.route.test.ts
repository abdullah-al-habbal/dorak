import { afterEach, describe, expect, it, vi } from "vitest";

import { backendReply } from "@tests/helpers/backend-reply.helper";
import { POST } from "@/app/api/auth/password/forgot/route";

vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => undefined }) }));

function forgotRequest(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request("http://app.test/api/auth/password/forgot", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

afterEach(() => vi.unstubAllGlobals());

describe("POST /api/auth/password/forgot", () => {
  it("rejects a malformed body without calling the backend", async () => {
    const fetchMock = backendReply(200);
    vi.stubGlobal("fetch", fetchMock);
    const response = await POST(forgotRequest({ actor: "manager", email: "not-an-email" }));
    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("maps the guard to the backend actor type and forwards the client IP", async () => {
    const fetchMock = backendReply(200, { data: null });
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(forgotRequest({ actor: "manager", email: " m@dorak.test " }, { "x-forwarded-for": "10.0.0.1, 203.0.113.9" }));

    expect(response.status).toBe(200);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/dashboard\/password\/forgot$/);
    expect(JSON.parse(String(init.body))).toEqual({ actor_type: "branch", email: "m@dorak.test" });
    expect(new Headers(init.headers).get("X-Forwarded-For")).toBe("203.0.113.9");
    expect(await response.json()).toMatchObject({ data: { requested: true } });
  });

  it("passes the backend's rate limit through as too_many_requests", async () => {
    vi.stubGlobal("fetch", backendReply(429));
    const response = await POST(forgotRequest({ actor: "owner", email: "o@dorak.test" }));
    expect(response.status).toBe(429);
    expect((await response.json()).error.code).toBe("too_many_requests");
  });
});
