import { describe, expect, it } from "vitest";

import { Locale } from "@/enums/access/locale.enum";
import { DICTIONARIES } from "@/locales/dictionaries.constant";

function keyPaths(value: unknown, prefix = ""): string[] {
  if (typeof value !== "object" || value === null) return [prefix];
  return Object.entries(value).flatMap(([key, child]) => keyPaths(child, prefix ? `${prefix}.${key}` : key));
}

describe("dictionaries", () => {
  it("keeps English and Arabic in key parity with no empty strings", () => {
    expect(keyPaths(DICTIONARIES[Locale.Ar]).sort()).toEqual(keyPaths(DICTIONARIES[Locale.En]).sort());
    for (const dictionary of Object.values(DICTIONARIES)) {
      expect(JSON.stringify(dictionary)).not.toContain('""');
    }
  });
});
