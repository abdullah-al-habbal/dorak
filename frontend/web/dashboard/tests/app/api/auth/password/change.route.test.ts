import { afterEach, describe, expect, it, vi } from "vitest";

import { backendReply } from "@tests/helpers/backend-reply.helper";
import { signClaim } from "@tests/helpers/claim.helper";
import { PUT } from "@/app/api/auth/password/change/route";

const jar = vi.hoisted(() => ({ values: {} as Record<string, string> }));
vi.mock("next/headers", () => ({
  cookies: async () => ({ get: (name: string) => (name in jar.values ? { value: jar.values[name] } : undefined) }),
}));

const BODY = { current_password: "old-password", password: "a-strong-password", password_confirmation: "a-strong-password" };

function changeRequest(body: unknown): Request {
  return new Request("http://app.test/api/auth/password/change", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
}

async function signIn(): Promise<void> {
  jar.values = { dashboard_claim: await signClaim(), dashboard_access: "tok", dashboard_refresh: "ref" };
}

afterEach(() => {
  vi.unstubAllGlobals();
  jar.values = {};
});

describe("PUT /api/auth/password/change", () => {
  it("returns 401 without a session and never calls the backend", async () => {
    const fetchMock = backendReply(200);
    vi.stubGlobal("fetch", fetchMock);
    expect((await PUT(changeRequest(BODY))).status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects a malformed body", async () => {
    await signIn();
    vi.stubGlobal("fetch", backendReply(200));
    expect((await PUT(changeRequest({ ...BODY, password: "short" }))).status).toBe(400);
  });

  it("sends this session's refresh token so the backend keeps it signed in", async () => {
    await signIn();
    const fetchMock = backendReply(200, { data: { password_updated: true } });
    vi.stubGlobal("fetch", fetchMock);

    const response = await PUT(changeRequest(BODY));

    expect(response.status).toBe(200);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/dashboard\/profile\/password$/);
    expect(init.method).toBe("PUT");
    expect(new Headers(init.headers).get("Authorization")).toBe("Bearer tok");
    expect(JSON.parse(String(init.body))).toEqual({ ...BODY, refresh_token: "ref" });
  });

  it("returns the wrong current password as a field error", async () => {
    await signIn();
    vi.stubGlobal("fetch", backendReply(422, { errors: { current_password: ["Wrong password."] } }));
    const response = await PUT(changeRequest(BODY));
    expect(response.status).toBe(400);
    expect((await response.json()).error.fields).toEqual({ current_password: ["Wrong password."] });
  });

  it("reports a backend 401 as an expired session, not bad credentials", async () => {
    await signIn();
    vi.stubGlobal("fetch", backendReply(401));
    const response = await PUT(changeRequest(BODY));
    expect(response.status).toBe(401);
    expect((await response.json()).error.code).toBe("session_expired");
  });
});
