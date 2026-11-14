import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { REFRESH_REPLAY_WINDOW_MS } from "@/config/refresh-coordination.constant";
import { refreshSession } from "@/services/api/auth/refresh";
import { signClaim } from "@tests/helpers/claim.helper";

function envelope(status: number, data?: unknown): Response {
  return new Response(JSON.stringify({ success: status < 400, statusCode: status, code: "X", message: "m", timestamp: "t", ...(data ? { data } : {}) }), {
    status,
    headers: { "content-type": "application/json" },
  });
}

async function session(refresh: string) {
  return { claim: await signClaim({ tid: "11" }), expires_in: 3600, token: "11|new", refresh_token: refresh, refresh_expires_in: 7200 };
}

let seq = 0;
const freshToken = () => `refresh-${++seq}`;

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("refreshSession single-flight", () => {
  it("shares one backend call between parallel callers with the same refresh token", async () => {
    const fetchMock = vi.fn().mockResolvedValue(envelope(200, await session("next")));
    vi.stubGlobal("fetch", fetchMock);
    const token = freshToken();

    const [a, b, c] = await Promise.all([refreshSession(token, undefined), refreshSession(token, undefined), refreshSession(token, undefined)]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(a).not.toBeNull();
    expect(b).toEqual(a);
    expect(c).toEqual(a);
  });

  it("serves the winner's session to a late caller inside the replay window, then asks the backend again", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(envelope(200, await session("next"))).mockResolvedValueOnce(envelope(401));
    vi.stubGlobal("fetch", fetchMock);
    const token = freshToken();

    const winner = await refreshSession(token, undefined);
    await vi.advanceTimersByTimeAsync(REFRESH_REPLAY_WINDOW_MS - 1);
    expect(await refreshSession(token, undefined)).toEqual(winner);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(2);
    expect(await refreshSession(token, undefined)).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("never keeps a failure: a rejected refresh token is retried against the backend", async () => {
    const fetchMock = vi.fn().mockImplementation(async () => envelope(401));
    vi.stubGlobal("fetch", fetchMock);
    const token = freshToken();

    expect(await refreshSession(token, undefined)).toBeNull();
    expect(await refreshSession(token, undefined)).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("keeps different refresh tokens apart", async () => {
    const fetchMock = vi.fn().mockImplementation(async () => envelope(200, await session("next")));
    vi.stubGlobal("fetch", fetchMock);

    await Promise.all([refreshSession(freshToken(), undefined), refreshSession(freshToken(), undefined)]);

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("forgets a network failure so the next caller can retry", async () => {
    const fetchMock = vi.fn().mockRejectedValueOnce(new Error("down")).mockResolvedValueOnce(envelope(200, await session("next")));
    vi.stubGlobal("fetch", fetchMock);
    const token = freshToken();

    await refreshSession(token, undefined).catch(() => null);
    expect(await refreshSession(token, undefined)).not.toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
