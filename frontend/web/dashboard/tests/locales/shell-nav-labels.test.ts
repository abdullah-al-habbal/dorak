import { describe, expect, it } from "vitest";

import { NAV_ITEMS } from "@/config/money-shell/nav.constant";
import { DICTIONARIES } from "@/locales/dictionaries.constant";

describe("sidebar labels", () => {
  it.each(Object.keys(DICTIONARIES))("gives every item of one portal its own %s label", (locale) => {
    const nav = DICTIONARIES[locale as keyof typeof DICTIONARIES].shell.nav as Record<string, string>;
    for (const [actor, items] of Object.entries(NAV_ITEMS)) {
      const labels = items.map((item) => nav[item.key]);
      const duplicated = labels.filter((label, index) => labels.indexOf(label) !== index);
      expect({ actor, duplicated }).toEqual({ actor, duplicated: [] });
    }
  });
});
