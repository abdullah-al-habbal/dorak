import { describe, expect, it } from "vitest";

import { PublicProfileKind } from "@/enums/public/public-profile-kind.enum";
import { parsePublicProfilePath } from "@/lib/public/public-profile-path.util";

describe("parsePublicProfilePath", () => {
  it.each([
    ["/brands/royal", PublicProfileKind.Brand, "royal"],
    ["/branches/main-st", PublicProfileKind.Branch, "main-st"],
    ["/stylists/omar-2/", PublicProfileKind.Stylist, "omar-2"],
  ])("reads %s", (path, kind, slug) => {
    expect(parsePublicProfilePath(path)).toEqual({ kind, slug });
  });

  it.each(["/", "/brands", "/brands/", "/brands/a/b", "/dashboard/admin", "/other/royal", "/brands/%E0%A4%A"])("ignores %s", (path) => {
    expect(parsePublicProfilePath(path)).toBeNull();
  });
});
