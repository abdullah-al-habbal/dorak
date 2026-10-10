import { afterEach, describe, expect, it, vi } from "vitest";
import { backendRequest } from "@/services/api/auth/backend-client";

function respond(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => vi.unstubAllGlobals());

describe("backendRequest", () => {
  it("keeps valid 2xx envelopes", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(respond({ success: true, statusCode: 200, code: "ok", message: "", timestamp: "2026-01-01T00:00:00Z", data: { id: "1" } })));
    await expect(backendRequest<{ id: string }>("/me")).resolves.toMatchObject({
      ok: true,
      status: 200,
      failure: "none",
      envelope: { data: { id: "1" } },
    });
  });

  it("sends public health probes without credentials", async () => {
    const fetchMock = vi.fn().mockResolvedValue(respond({
      success: true,
      statusCode: 200,
      code: "ok",
      message: "",
      timestamp: "2026-01-01T00:00:00Z",
    }));
    vi.stubGlobal("fetch", fetchMock);

    await backendRequest("/health");

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:8000/health", expect.objectContaining({ redirect: "manual" }));
    expect((fetchMock.mock.calls[0]?.[1] as RequestInit).headers).toBeInstanceOf(Headers);
    expect(((fetchMock.mock.calls[0]?.[1] as RequestInit).headers as Headers).has("Authorization")).toBe(false);
  });

  it("preserves client and server statuses", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(respond({ success: false, statusCode: 503, code: "unavailable", message: "Unavailable", timestamp: "2026-01-01T00:00:00Z" }, 503)));
    await expect(backendRequest("/me")).resolves.toMatchObject({
      ok: false,
      status: 503,
      failure: "none",
    });
  });

  it("classifies redirects, malformed payloads, and transport failures", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 302 })));
    await expect(backendRequest("/me")).resolves.toMatchObject({ failure: "redirect", status: 302 });

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(respond({ unexpected: true })));
    await expect(backendRequest("/me")).resolves.toMatchObject({ failure: "invalid-response" });

    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("refused")));
    await expect(backendRequest("/me")).resolves.toMatchObject({ failure: "transport", status: 0 });
  });
});
