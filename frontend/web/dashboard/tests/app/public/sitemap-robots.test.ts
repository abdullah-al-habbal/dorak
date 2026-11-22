import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const feed = vi.hoisted(() => vi.fn());

vi.mock("next/server", () => ({ connection: async (): Promise<void> => {} }));
vi.mock("@/services/api/public/public-profile", () => ({ fetchPublicSitemap: feed }));

import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

const FEED = {
  brands: [{ slug: "royal", updated_at: "2026-11-01T10:00:00+00:00" }],
  branches: [{ slug: "main", updated_at: null }],
  stylists: [{ slug: "omar", updated_at: "2026-11-02T10:00:00+00:00" }],
};

beforeEach(() => vi.stubEnv("PUBLIC_SITE_URL", "https://dorak.example"));
afterEach(() => {
  vi.unstubAllEnvs();
  feed.mockReset();
});

describe("sitemap", () => {
  it("lists the brand, branch and stylist profiles as absolute URLs", async () => {
    feed.mockResolvedValue(FEED);
    const entries = await sitemap();
    expect(entries.map((entry) => entry.url)).toEqual(["https://dorak.example/brands/royal", "https://dorak.example/branches/main", "https://dorak.example/stylists/omar"]);
    expect(entries[0]?.lastModified).toBe("2026-11-01T10:00:00+00:00");
    expect(entries[1]?.lastModified).toBeUndefined();
  });

  it("is empty when the backend is unreachable, so an outage never publishes a wrong sitemap", async () => {
    feed.mockResolvedValue(null);
    expect(await sitemap()).toEqual([]);
  });

  it("is empty, without calling the backend, when the site origin is not configured", async () => {
    vi.stubEnv("PUBLIC_SITE_URL", "");
    expect(await sitemap()).toEqual([]);
    expect(feed).not.toHaveBeenCalled();
  });
});

describe("robots", () => {
  it("allows the public pages, blocks the workspaces and API, and announces the sitemap", async () => {
    expect(await robots()).toEqual({ rules: { userAgent: "*", allow: "/", disallow: ["/dashboard/", "/api/"] }, sitemap: "https://dorak.example/sitemap.xml" });
  });

  it("omits the sitemap line when the site origin is not configured", async () => {
    vi.stubEnv("PUBLIC_SITE_URL", "");
    expect((await robots()).sitemap).toBeUndefined();
  });
});
