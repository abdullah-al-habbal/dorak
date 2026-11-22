import { describe, expect, it } from "vitest";

import { Locale } from "@/enums/access/locale.enum";
import { absoluteUrl, metaDescription, pickText, shortTime, weekRows } from "@/lib/public/public-profile.util";

describe("pickText", () => {
  it("answers in the visitor's language, then the other one", () => {
    expect(pickText({ en: "Downtown", ar: "وسط المدينة" }, Locale.Ar)).toBe("وسط المدينة");
    expect(pickText({ en: "Downtown", ar: "وسط المدينة" }, Locale.En)).toBe("Downtown");
    expect(pickText({ en: "Downtown", ar: "" }, Locale.Ar)).toBe("Downtown");
    expect(pickText({ en: null, ar: "وسط" }, Locale.En)).toBe("وسط");
  });

  it("returns a plain string and tolerates a missing value", () => {
    expect(pickText("Cut", Locale.Ar)).toBe("Cut");
    expect(pickText(null, Locale.En)).toBe("");
    expect(pickText({}, Locale.En)).toBe("");
  });
});

describe("metaDescription", () => {
  it("flattens whitespace and cuts long text with an ellipsis", () => {
    expect(metaDescription("a\n\n b")).toBe("a b");
    const cut = metaDescription("x".repeat(500));
    expect(cut).toHaveLength(160);
    expect(cut.endsWith("…")).toBe(true);
  });
});

describe("weekRows", () => {
  it("starts on the given day and marks unconfigured days closed", () => {
    const rows = weekRows([{ day_of_week: 1, is_closed: false, shifts: [{ opens_time: "09:00:00", closes_time: "17:00:00" }] }], 6);
    expect(rows.map((row) => row.day_of_week)).toEqual([6, 0, 1, 2, 3, 4, 5]);
    expect(rows[2]?.shifts).toHaveLength(1);
    expect(rows[0]?.is_closed).toBe(true);
  });
});

describe("shortTime and absoluteUrl", () => {
  it("trims seconds", () => expect(shortTime("09:30:00")).toBe("09:30"));
  it("builds an absolute URL only from a valid origin", () => {
    expect(absoluteUrl("https://dorak.example", "/brands/a")).toBe("https://dorak.example/brands/a");
    expect(absoluteUrl(undefined, "/brands/a")).toBe("/brands/a");
    expect(absoluteUrl("not a url", "/brands/a")).toBe("/brands/a");
  });
});
