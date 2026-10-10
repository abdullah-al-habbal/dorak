import { afterEach, describe, expect, it, vi } from "vitest";
import { apiRequest } from "@/services/api/client";

function respond(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => vi.unstubAllGlobals());

describe("apiRequest status matrix", () => {
  it("extracts 2xx success envelopes", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(respond({ success: true, data: { id: "1" }, message: "" })));
    await expect(apiRequest<{ id: string }>("/api/example")).resolves.toEqual({ id: "1" });
  });

  it("rejects 3xx responses before envelope parsing", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 302 })));
    await expect(apiRequest("/api/example")).rejects.toMatchObject({
      status: 302,
      kind: "redirect",
    });
  });

  it.each([400, 401, 403, 404, 422, 500, 503])("preserves HTTP status %i", async (status) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(respond({ success: false, error: { code: "failed" }, message: "Failed" }, status)));
    await expect(apiRequest("/api/example")).rejects.toMatchObject({ status, kind: "http" });
  });

  it("rejects malformed and empty contracts", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(respond({ unexpected: true })));
    await expect(apiRequest("/api/example")).rejects.toMatchObject({ kind: "invalid-response" });
  });

  it("classifies rejected browser fetches without raw errors", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    await expect(apiRequest("/api/example")).rejects.toMatchObject({ status: 0 });
  });
});
