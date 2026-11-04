import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { apiRequest } from "@/services/api/core/client";
import { ApiClientError } from "@/services/api/core/api-client-error";
import { onSessionExpired } from "@/services/api/core/session-expiry.util";

const schema = z.object({ ok: z.boolean() });

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}
const success = { success: true, message: "", data: { ok: true } };
const failure = { success: false, message: "nope", error: { code: "session_expired" } };

afterEach(() => vi.unstubAllGlobals());

describe("apiRequest", () => {
  it("refreshes once on 401 and retries", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(json(401, failure))
      .mockResolvedValueOnce(json(200, { success: true, message: "", data: { refreshed: true } }))
      .mockResolvedValueOnce(json(200, success));
    vi.stubGlobal("fetch", fetchMock);

    await expect(apiRequest("/api/x", { schema })).resolves.toEqual({ ok: true });
    expect(fetchMock.mock.calls.map((call) => call[0])).toEqual(["/api/x", "/api/auth/refresh", "/api/x"]);
  });

  it("reports session expiry when the refresh fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockImplementation(() => Promise.resolve(json(401, failure))));
    const listener = vi.fn();
    const off = onSessionExpired(listener);
    await expect(apiRequest("/api/x", { schema })).rejects.toBeInstanceOf(ApiClientError);
    expect(listener).toHaveBeenCalledOnce();
    off();
  });

  it("turns a network failure into a typed error and rejects malformed success data", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
    await expect(apiRequest("/api/x", { schema })).rejects.toMatchObject({ code: "network_error", status: 0 });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json(200, { success: true, message: "", data: { ok: "yes" } })));
    await expect(apiRequest("/api/x", { schema })).rejects.toMatchObject({ code: "server_error" });
  });
});
