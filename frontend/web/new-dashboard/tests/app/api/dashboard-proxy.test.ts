import { afterEach, describe, expect, it, vi } from "vitest";

import { signClaim } from "@tests/helpers/claim.helper";
import { GET, PATCH } from "@/app/api/dashboard/[...path]/route";

const jar = vi.hoisted(() => ({ values: {} as Record<string, string> }));
vi.mock("next/headers", () => ({
  cookies: async () => ({ get: (name: string) => (name in jar.values ? { value: jar.values[name] } : undefined) }),
}));

function backendReply(status: number, envelope: Record<string, unknown>) {
  return vi.fn().mockResolvedValue(
    new Response(
      JSON.stringify({ success: status < 400, statusCode: status, code: "X", message: "m", timestamp: "t", ...envelope }),
      { status, headers: { "content-type": "application/json" } },
    ),
  );
}

function call(handler: typeof GET, path: string[], init?: RequestInit, search = "") {
  const request = new Request(`http://app.test/api/dashboard/${path.join("/")}${search}`, init);
  return handler(request, { params: Promise.resolve({ path }) });
}

async function signIn(overrides: Record<string, unknown> = {}) {
  jar.values = { dashboard_claim: await signClaim(overrides), dashboard_access: "tok", NEXT_LOCALE: "ar" };
}

afterEach(() => {
  vi.unstubAllGlobals();
  jar.values = {};
});

describe("dashboard proxy", () => {
  it("returns 401 without a session and never calls the backend", async () => {
    const fetchMock = backendReply(200, {});
    vi.stubGlobal("fetch", fetchMock);
    const response = await call(GET, ["bookings"]);
    expect(response.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("forwards path, query, bearer, claim and locale; returns data and meta untouched", async () => {
    await signIn();
    const fetchMock = backendReply(200, { data: [{ id: 1 }], meta: { pagination: { page: 1 } } });
    vi.stubGlobal("fetch", fetchMock);

    const response = await call(GET, ["bookings"], undefined, "?date_from=2026-11-01&page=2");

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://backend.test/api/v1/dashboard/bookings?date_from=2026-11-01&page=2");
    expect(new Headers(init.headers).get("authorization")).toBe("Bearer tok");
    expect(new Headers(init.headers).get("accept-language")).toBe("ar");
    expect(new Headers(init.headers).get("x-dashboard-session")).toBeTruthy();
    expect(await response.json()).toEqual({ success: true, message: "m", data: [{ id: 1 }], meta: { pagination: { page: 1 } } });
  });

  it("forwards a JSON body on PATCH", async () => {
    await signIn();
    const fetchMock = backendReply(200, { data: { id: 1 } });
    vi.stubGlobal("fetch", fetchMock);
    await call(PATCH, ["bookings", "1"], { method: "PATCH", body: JSON.stringify({ booking_status: "confirmed" }) });
    expect(JSON.parse(String(fetchMock.mock.calls[0][1].body))).toEqual({ booking_status: "confirmed" });
  });

  it("denies paths outside the allow-list, including /barbers", async () => {
    await signIn();
    const fetchMock = backendReply(200, {});
    vi.stubGlobal("fetch", fetchMock);
    expect((await call(GET, ["barbers"])).status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("answers 405 with Allow for a wrong method", async () => {
    await signIn();
    const response = await call(PATCH, ["earnings"], { method: "PATCH", body: "{}" });
    expect(response.status).toBe(405);
    expect(response.headers.get("allow")).toBe("GET");
  });

  it("rejects a guard that the rule does not permit", async () => {
    await signIn({ actor_type: "barber", role: "barber" });
    vi.stubGlobal("fetch", backendReply(200, {}));
    expect((await call(GET, ["bookings"])).status).toBe(403);
  });

  it("maps 422 fields, 429 and a backend 401", async () => {
    await signIn();
    vi.stubGlobal("fetch", backendReply(422, { errors: { booking_status: ["bad"] } }));
    const invalid = await call(PATCH, ["bookings", "1"], { method: "PATCH", body: "{}" });
    expect(invalid.status).toBe(400);
    expect((await invalid.json()).error.fields).toEqual({ booking_status: ["bad"] });

    vi.stubGlobal("fetch", backendReply(429, {}));
    expect((await call(GET, ["bookings"])).status).toBe(429);

    vi.stubGlobal("fetch", backendReply(401, {}));
    const expired = await call(GET, ["bookings"]);
    expect(expired.status).toBe(401);
    expect((await expired.json()).error.code).toBe("session_expired");
  });

  it("keeps the backend message for a 409 conflict and a rule-based 422", async () => {
    await signIn();
    vi.stubGlobal("fetch", backendReply(409, { code: "BOOKING_SLOT_CONFLICT", message: "Slot taken" }));
    const conflict = await call(PATCH, ["bookings", "1", "reschedule"], { method: "PATCH", body: "{}" });
    expect(conflict.status).toBe(409);
    expect(await conflict.json()).toMatchObject({ error: { code: "conflict" }, message: "Slot taken" });

    vi.stubGlobal("fetch", backendReply(422, { message: "Outside opening hours" }));
    const rule = await call(PATCH, ["bookings", "1", "reschedule"], { method: "PATCH", body: "{}" });
    expect(rule.status).toBe(400);
    expect((await rule.json()).message).toBe("Outside opening hours");
  });

  it("rejects malformed JSON", async () => {
    await signIn();
    vi.stubGlobal("fetch", backendReply(200, {}));
    expect((await call(PATCH, ["bookings", "1"], { method: "PATCH", body: "{" })).status).toBe(400);
  });
});
