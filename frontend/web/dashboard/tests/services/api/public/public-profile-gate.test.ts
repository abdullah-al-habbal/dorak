import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PublicProfileKind } from "@/enums/public/public-profile-kind.enum";
import { gatePublicProfile } from "@/services/api/public/public-profile-gate";

const TARGET = { kind: PublicProfileKind.Brand, slug: "royal" };
const BRAND = { slug: "royal", name: { en: "Royal", ar: "رويال" }, description: [], logo_url: null, branches: [] };

function backend(status: number, body: unknown = {}): void {
  vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } })));
}

function run(): Promise<Response> {
  return gatePublicProfile(new NextRequest("http://localhost/brands/royal"), TARGET);
}

afterEach(() => vi.unstubAllGlobals());

describe("gatePublicProfile", () => {
  it("rewrites an unknown or hidden slug to the 404 route with status 404", async () => {
    backend(404);
    const response = await run();
    expect(response.status).toBe(404);
    expect(response.headers.get("x-middleware-rewrite")).toContain("/_not-found");
  });

  it("lets a found profile through", async () => {
    backend(200, { success: true, message: "ok", data: BRAND });
    const response = await run();
    expect(response.status).toBe(200);
    expect(response.headers.get("x-middleware-rewrite")).toBeNull();
  });

  it.each([429, 500, 503])("never turns a backend %s into a 404", async (status) => {
    backend(status);
    const response = await run();
    expect(response.status).toBe(200);
    expect(response.headers.get("x-middleware-rewrite")).toBeNull();
  });

  it("never turns an unreachable backend into a 404", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new Error("down"))));
    expect((await run()).headers.get("x-middleware-rewrite")).toBeNull();
  });
});
