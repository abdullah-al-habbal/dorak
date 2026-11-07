import { describe, expect, it } from "vitest";

import { resolvePageInfo } from "@/lib/resolve-page-info.util";

describe("resolvePageInfo", () => {
  it("uses the backend pagination block when it is valid", () => {
    const pagination = { total: 45, per_page: 20, current_page: 2, total_pages: 3 };
    expect(resolvePageInfo({ pagination }, 20, 20, 2)).toEqual(pagination);
  });

  it("falls back to a single page when meta is missing", () => {
    expect(resolvePageInfo(null, 7, 20, 1)).toEqual({ total: 7, per_page: 20, current_page: 1, total_pages: 1 });
  });

  it("falls back when the pagination block is malformed", () => {
    expect(resolvePageInfo({ pagination: { total: "x" } }, 3, 10, 4)).toEqual({ total: 3, per_page: 10, current_page: 4, total_pages: 1 });
  });
});
