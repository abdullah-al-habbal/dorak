import { afterEach, describe, expect, it, vi } from "vitest";
import { ROUTES } from "@/config/routes.constant";
import { api, apiRequest } from "@/services/api/core/client";
import { subscribeSessionExpiry } from "@/services/api/core/session-expiry";

function respond(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => vi.unstubAllGlobals());

describe("apiRequest status matrix", () => {
  it("extracts 2xx success envelopes", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          respond({ success: true, data: { id: "1" }, message: "" }),
        ),
    );
    await expect(apiRequest<{ id: string }>("/api/example")).resolves.toEqual({
      id: "1",
    });
  });

  it("rejects 3xx responses before envelope parsing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 302 })),
    );
    await expect(apiRequest("/api/example")).rejects.toMatchObject({
      status: 302,
      kind: "redirect",
    });
  });

  it.each([400, 401, 403, 404, 422, 500, 503])(
    "preserves HTTP status %i",
    async (status) => {
      vi.stubGlobal(
        "fetch",
        vi
          .fn()
          .mockResolvedValue(
            respond(
              { success: false, error: { code: "failed" }, message: "Failed" },
              status,
            ),
          ),
      );
      await expect(apiRequest("/api/example")).rejects.toMatchObject({
        status,
        kind: "http",
      });
    },
  );

  it("rejects malformed and empty contracts", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(respond({ unexpected: true })),
    );
    await expect(apiRequest("/api/example")).rejects.toMatchObject({
      kind: "invalid-response",
    });
  });

  it("classifies rejected browser fetches without raw errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
    );
    await expect(apiRequest("/api/example")).rejects.toMatchObject({
      status: 0,
    });
  });
});

describe("api.upload", () => {
  it("sends the FormData body as-is without a JSON Content-Type", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        respond({ success: true, data: { id: "1" }, message: "" }),
      );
    vi.stubGlobal("fetch", fetchMock);
    const formData = new FormData();
    formData.append("photo", new File(["x"], "x.jpg"));

    await api.upload("/barber/portfolio", formData);

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe("POST");
    expect(init.body).toBe(formData);
    expect((init.headers as Headers).has("Content-Type")).toBe(false);
  });
});

describe("apiRequest session refresh", () => {
  const ok = () => respond({ success: true, data: { id: "1" }, message: "" });
  const unauthorized = () =>
    respond({ success: false, message: "Unauthenticated." }, 401);

  function urlRouter(handlers: Record<string, () => Response>) {
    const seen: string[] = [];
    const fetchMock = vi.fn(async (path: string) => {
      seen.push(path);
      const queue = handlers[path];
      if (!queue) throw new Error(`unexpected ${path}`);
      return queue();
    });
    vi.stubGlobal("fetch", fetchMock);

    return { seen, fetchMock };
  }

  it("refreshes once on 401 and retries the original request", async () => {
    let calls = 0;
    const { seen } = urlRouter({
      "/api/example": () => (calls++ === 0 ? unauthorized() : ok()),
      [ROUTES.api.auth.refresh]: () => respond({ success: true }, 200),
    });

    await expect(
      apiRequest<{ id: string }>("/api/example", { auth: "session" }),
    ).resolves.toEqual({ id: "1" });
    expect(seen).toEqual([
      "/api/example",
      ROUTES.api.auth.refresh,
      "/api/example",
    ]);
  });

  it("shares one refresh across concurrent 401s", async () => {
    const attempts = new Map<string, number>();
    const { seen } = urlRouter({
      "/api/a": () => (bump(attempts, "a") === 1 ? unauthorized() : ok()),
      "/api/b": () => (bump(attempts, "b") === 1 ? unauthorized() : ok()),
      "/api/c": () => (bump(attempts, "c") === 1 ? unauthorized() : ok()),
      [ROUTES.api.auth.refresh]: () => respond({ success: true }, 200),
    });

    await Promise.all(
      ["/api/a", "/api/b", "/api/c"].map((path) =>
        apiRequest(path, { auth: "session" }),
      ),
    );

    expect(
      seen.filter((path) => path === ROUTES.api.auth.refresh),
    ).toHaveLength(1);
  });

  it("reports session expiry once and does not loop when refresh fails", async () => {
    const listener = vi.fn();
    const unsubscribe = subscribeSessionExpiry(listener);
    const { seen } = urlRouter({
      "/api/example": unauthorized,
      [ROUTES.api.auth.refresh]: unauthorized,
    });

    await expect(
      apiRequest("/api/example", { auth: "session" }),
    ).rejects.toMatchObject({ status: 401 });
    unsubscribe();

    expect(listener).toHaveBeenCalledTimes(1);
    expect(seen).toEqual(["/api/example", ROUTES.api.auth.refresh]);
  });

  it("never refreshes for public requests", async () => {
    const { seen } = urlRouter({ "/api/example": unauthorized });

    await expect(apiRequest("/api/example")).rejects.toMatchObject({
      status: 401,
    });
    expect(seen).toEqual(["/api/example"]);
  });
});

function bump(counts: Map<string, number>, key: string): number {
  const next = (counts.get(key) ?? 0) + 1;
  counts.set(key, next);

  return next;
}
