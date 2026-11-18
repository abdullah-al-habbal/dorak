import { describe, expect, it } from "vitest";

import { Locale } from "@/enums/access/locale.enum";
import { DICTIONARIES } from "@/locales/dictionaries.constant";

function keyPaths(value: unknown, prefix = ""): string[] {
  if (typeof value !== "object" || value === null) return [prefix];
  return Object.entries(value).flatMap(([key, child]) => keyPaths(child, prefix ? `${prefix}.${key}` : key));
}

function leaves(value: unknown, prefix = ""): Array<[string, string]> {
  if (typeof value === "string") return [[prefix, value]];
  if (typeof value !== "object" || value === null) return [];
  return Object.entries(value).flatMap(([key, child]) => leaves(child, prefix ? `${prefix}.${key}` : key));
}

function placeholders(text: string): string[] {
  return text.match(/\{[A-Za-z]+\}/g) ?? [];
}

describe("dictionaries", () => {
  it("never gives Arabic a {placeholder} the English string lacks (Arabic may drop one, such as a plural unit)", () => {
    const arabic = new Map(leaves(DICTIONARIES[Locale.Ar]));
    const mismatched = leaves(DICTIONARIES[Locale.En]).filter(([path, text]) => placeholders(arabic.get(path) ?? "").some((name) => !placeholders(text).includes(name)));
    expect(mismatched.map(([path]) => path)).toEqual([]);
  });

  it("keeps English and Arabic in key parity with no empty strings", () => {
    expect(keyPaths(DICTIONARIES[Locale.Ar]).sort()).toEqual(keyPaths(DICTIONARIES[Locale.En]).sort());
    for (const dictionary of Object.values(DICTIONARIES)) {
      expect(JSON.stringify(dictionary)).not.toContain('""');
    }
  });
});
