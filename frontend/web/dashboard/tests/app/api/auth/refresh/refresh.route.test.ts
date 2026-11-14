import { afterEach, describe, expect, it, vi } from "vitest";

import { backendReply } from "@tests/helpers/backend-reply.helper";
import { signClaim } from "@tests/helpers/claim.helper";
import { POST } from "@/app/api/auth/refresh/route";

const jar = vi.hoisted(() => ({ values: {} as Record<string, string> }));
vi.mock("next/headers", () => ({
  cookies: async () => ({ get: (name: string) => (name in jar.values ? { value: jar.values[name] } : undefined) }),
}));

let refreshSequence = 0;
/** The BFF shares a just-rotated session per refresh token, so every test presents its own. */
const uniqueRefresh = () => `ref-test-${++refreshSequence}`;

function refreshRequest(): Request {
  return new Request("http://app.test/api/auth/refresh", { method: "POST" });
}

async function refreshedSession() {
  return { claim: await signClaim({ tid: "11" }), expires_in: 3600, token: "11|new", refresh_token: "ref-2", refresh_expires_in: 7200 };
}

afterEach(() => {
  vi.unstubAllGlobals();
  jar.values = {};
});

describe("POST /api/auth/refresh with the tid-bound claim", () => {
  it("does not call the backend while the claim is live and bound", async () => {
    jar.values = { dashboard_claim: await signClaim(), dashboard_access: "10|tok", dashboard_refresh: uniqueRefresh() };
    const fetchMock = backendReply(200);
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(refreshRequest());

    expect(await response.json()).toMatchObject({ data: { refreshed: false } });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("migrates a legacy session (claim without tid) through its refresh token and sets the new pair together", async () => {
    jar.values = { dashboard_claim: await signClaim({ tid: undefined }), dashboard_access: "old-token", dashboard_refresh: uniqueRefresh() };
    const fetchMock = backendReply(200, { data: await refreshedSession() });
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(refreshRequest());

    expect(await response.json()).toMatchObject({ data: { refreshed: true } });
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/dashboard\/refresh$/);
    expect(JSON.parse(String(init.body))).toMatchObject({ refresh_token: jar.values.dashboard_refresh });
    const cookies = response.headers.getSetCookie().join(";");
    expect(cookies).toMatch(/dashboard_claim=/);
    expect(cookies).toMatch(/dashboard_access=11%7Cnew|dashboard_access=11\|new/);
    expect(cookies).toMatch(/dashboard_refresh=ref-2/);
  });

  it("refuses a refreshed claim that carries no tid and clears the session instead of storing a mismatched pair", async () => {
    jar.values = { dashboard_claim: await signClaim({ tid: undefined }), dashboard_access: "old-token", dashboard_refresh: uniqueRefresh() };
    vi.stubGlobal("fetch", backendReply(200, { data: { ...(await refreshedSession()), claim: await signClaim({ tid: undefined }) } }));

    const response = await POST(refreshRequest());

    expect(response.status).toBe(401);
    expect(response.headers.getSetCookie().join(";")).toMatch(/dashboard_claim=;/);
  });

  it("clears the cookies and answers 401 when the backend rejects the refresh token", async () => {
    jar.values = { dashboard_claim: await signClaim({ tid: undefined }), dashboard_access: "old-token", dashboard_refresh: uniqueRefresh() };
    vi.stubGlobal("fetch", backendReply(401));

    const response = await POST(refreshRequest());

    expect(response.status).toBe(401);
    expect(response.headers.getSetCookie().join(";")).toMatch(/dashboard_refresh=;/);
  });

  it("answers two parallel requests with the same refresh cookie from one backend call and the same cookies, without deleting any", async () => {
    jar.values = { dashboard_claim: await signClaim({ tid: undefined }), dashboard_access: "old-token", dashboard_refresh: "ref-parallel" };
    const fetchMock = backendReply(200, { data: await refreshedSession() });
    vi.stubGlobal("fetch", fetchMock);

    const [first, second] = await Promise.all([POST(refreshRequest()), POST(refreshRequest())]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    for (const response of [first, second]) {
      expect(response.status).toBe(200);
      const cookies = response.headers.getSetCookie().join(";");
      expect(cookies).toMatch(/dashboard_refresh=ref-2/);
      expect(cookies).not.toMatch(/dashboard_refresh=;/);
    }
    expect(first.headers.getSetCookie()).toEqual(second.headers.getSetCookie());
  });

  it("answers 401 without a backend call when there is neither a live claim nor a refresh cookie", async () => {
    jar.values = { dashboard_claim: await signClaim({ tid: undefined }) };
    const fetchMock = backendReply(200);
    vi.stubGlobal("fetch", fetchMock);

    expect((await POST(refreshRequest())).status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
