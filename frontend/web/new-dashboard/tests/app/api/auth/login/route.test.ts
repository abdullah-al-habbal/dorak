import { afterEach, describe, expect, it, vi } from "vitest";

import { signClaim } from "@tests/helpers/claim.helper";
import { POST } from "@/app/api/auth/login/route";

function loginRequest(body: unknown): Request {
  return new Request("http://app.test/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json", cookie: "NEXT_LOCALE=ar" },
    body: JSON.stringify(body),
  });
}

function backendReply(status: number, envelope: Record<string, unknown>) {
  return vi.fn().mockResolvedValue(
    new Response(
      JSON.stringify({ success: status < 400, statusCode: status, code: "X", message: "", timestamp: "t", ...envelope }),
      { status, headers: { "content-type": "application/json" } },
    ),
  );
}

afterEach(() => vi.unstubAllGlobals());

describe("POST /api/auth/login", () => {
  it("rejects a malformed body", async () => {
    const response = await POST(loginRequest({ actor: "hacker" }));
    expect(response.status).toBe(400);
  });

  it("sets HttpOnly session cookies on success", async () => {
    const claim = await signClaim();
    const fetchMock = backendReply(200, {
      data: { claim, expires_in: 3600, token: "tok", refresh_token: "ref", refresh_expires_in: 7200 },
    });
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(loginRequest({ actor: "manager", email: "m@dorak.test", password: "pw" }));

    expect(response.status).toBe(200);
    expect(JSON.parse(String(fetchMock.mock.calls[0][1].body))).toEqual({ actor_type: "branch", email: "m@dorak.test", password: "pw" });
    const cookies = response.headers.getSetCookie().join("\n");
    expect(cookies).toMatch(/dashboard_access=tok.*HttpOnly/i);
    expect(cookies).toMatch(/dashboard_refresh=ref.*HttpOnly/i);
    expect(cookies).toMatch(/dashboard_claim=/);
  });

  it("refuses a claim issued for a different actor", async () => {
    const claim = await signClaim({ actor_type: "admin", role: "platform_admin" });
    vi.stubGlobal("fetch", backendReply(200, { data: { claim, expires_in: 60, token: "t", refresh_token: "r", refresh_expires_in: 60 } }));
    const response = await POST(loginRequest({ actor: "manager", email: "m@dorak.test", password: "pw" }));
    expect(response.status).toBe(502);
    expect(response.headers.getSetCookie()).toHaveLength(0);
  });

  it("returns a localized invalid-credentials failure", async () => {
    vi.stubGlobal("fetch", backendReply(401, { code: "UNAUTHORIZED" }));
    const response = await POST(loginRequest({ actor: "admin", email: "a@dorak.test", password: "bad" }));
    const body = await response.json();
    expect(response.status).toBe(401);
    expect(body.error.code).toBe("invalid_credentials");
    expect(body.message).toContain("غير صحيحة");
  });

  it("reports an unreachable backend as 503", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
    const response = await POST(loginRequest({ actor: "admin", email: "a@dorak.test", password: "pw" }));
    expect(response.status).toBe(503);
  });
});
