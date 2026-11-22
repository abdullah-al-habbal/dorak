import { afterEach, describe, expect, it, vi } from "vitest";

import { BACKEND_PATH } from "@/config/backend.constant";
import { HttpMethod } from "@/enums/access/http-method.enum";
import { backendRequest } from "@/services/api/auth/backend-client";

function okEnvelope(): Response {
  return new Response(JSON.stringify({ success: true, statusCode: 200, code: "OK", message: "m", timestamp: "t", data: {} }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("backendRequest locale", () => {
  it.each(["ar", "en"])("forwards the page locale %s as Accept-Language so the backend localises display_name", async (locale) => {
    const fetchMock = vi.fn().mockResolvedValue(okEnvelope());
    vi.stubGlobal("fetch", fetchMock);

    await backendRequest({ path: BACKEND_PATH.me, method: HttpMethod.Get, accessToken: "1|t", locale });

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(new Headers(init.headers).get("Accept-Language")).toBe(locale);
  });

  it("sends no Accept-Language when no locale is given", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okEnvelope());
    vi.stubGlobal("fetch", fetchMock);

    await backendRequest({ path: BACKEND_PATH.me, method: HttpMethod.Get, accessToken: "1|t" });

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(new Headers(init.headers).has("Accept-Language")).toBe(false);
  });
});
