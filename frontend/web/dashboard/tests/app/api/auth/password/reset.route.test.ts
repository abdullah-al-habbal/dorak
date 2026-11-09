import { afterEach, describe, expect, it, vi } from "vitest";

import { backendReply } from "@tests/helpers/backend-reply.helper";
import { POST } from "@/app/api/auth/password/reset/route";

vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => undefined }) }));

const VALID = { actor: "barber", email: "b@dorak.test", token: "t".repeat(64), password: "a-strong-password", password_confirmation: "a-strong-password" };

function resetRequest(body: unknown): Request {
  return new Request("http://app.test/api/auth/password/reset", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
}

afterEach(() => vi.unstubAllGlobals());

describe("POST /api/auth/password/reset", () => {
  it.each([
    ["a short password", { ...VALID, password: "short", password_confirmation: "short" }],
    ["a missing token", { ...VALID, token: "" }],
    ["an unknown guard", { ...VALID, actor: "root" }],
  ])("rejects %s without calling the backend", async (_label, body) => {
    const fetchMock = backendReply(200);
    vi.stubGlobal("fetch", fetchMock);
    expect((await POST(resetRequest(body))).status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends the reset with the backend actor type", async () => {
    const fetchMock = backendReply(200, { data: null });
    vi.stubGlobal("fetch", fetchMock);
    const response = await POST(resetRequest(VALID));
    expect(response.status).toBe(200);
    const { email, token, password, password_confirmation } = VALID;
    expect(JSON.parse(String(fetchMock.mock.calls[0][1].body))).toEqual({ actor_type: "barber", email, token, password, password_confirmation });
  });

  it("keeps the backend's token field error so the page can offer a new link", async () => {
    vi.stubGlobal("fetch", backendReply(422, { errors: { token: ["This link can’t be used."] } }));
    const response = await POST(resetRequest(VALID));
    expect(response.status).toBe(400);
    expect((await response.json()).error.fields).toEqual({ token: ["This link can’t be used."] });
  });
});
