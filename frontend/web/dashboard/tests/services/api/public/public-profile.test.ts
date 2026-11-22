import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchPublicBrand, fetchPublicSitemap } from "@/services/api/public/public-profile";

const BRAND = { slug: "royal", name: { en: "Royal", ar: "رويال" }, description: [], logo_url: null, branches: [] };

function respond(status: number, body: unknown): void {
  vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } })));
}

afterEach(() => vi.unstubAllGlobals());

describe("fetchPublicProfile", () => {
  it("returns the parsed profile", async () => {
    respond(200, { success: true, message: "ok", data: BRAND });
    expect(await fetchPublicBrand("royal")).toMatchObject({ status: "found", profile: { slug: "royal" } });
  });

  it("calls the public endpoint with an encoded slug", async () => {
    respond(200, { success: true, message: "ok", data: BRAND });
    await fetchPublicBrand("a/b");
    expect(vi.mocked(fetch).mock.calls[0]?.[0]).toContain("/api/v1/public/brands/a%2Fb");
  });

  it("maps 404 to not-found and other failures to unavailable", async () => {
    respond(404, { success: false, message: "no" });
    expect(await fetchPublicBrand("x")).toEqual({ status: "not-found" });
    respond(500, {});
    expect(await fetchPublicBrand("x")).toEqual({ status: "unavailable" });
    respond(200, { success: true, message: "ok", data: { nope: true } });
    expect(await fetchPublicBrand("x")).toEqual({ status: "unavailable" });
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("down"); }));
    expect(await fetchPublicBrand("x")).toEqual({ status: "unavailable" });
  });
});

describe("fetchPublicSitemap", () => {
  it("returns the slug lists and calls the sitemap feed", async () => {
    respond(200, { success: true, message: "ok", data: { brands: [{ slug: "royal", updated_at: null }], branches: [], stylists: [] } });
    expect(await fetchPublicSitemap()).toMatchObject({ brands: [{ slug: "royal" }] });
    expect(vi.mocked(fetch).mock.calls[0]?.[0]).toContain("/api/v1/public/sitemap");
  });

  it("is null on a failure or an unexpected body", async () => {
    respond(500, {});
    expect(await fetchPublicSitemap()).toBeNull();
    respond(200, { success: true, message: "ok", data: { nope: true } });
    expect(await fetchPublicSitemap()).toBeNull();
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("down"); }));
    expect(await fetchPublicSitemap()).toBeNull();
  });
});
