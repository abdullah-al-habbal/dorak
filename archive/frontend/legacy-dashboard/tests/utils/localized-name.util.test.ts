import { describe, expect, it } from "vitest";
import { localizedName } from "@/utils/localized-name.util";

describe("localizedName", () => {
  it("returns the name in the viewer locale", () => {
    expect(localizedName({ en: "Salon", ar: "صالون" }, "ar")).toBe("صالون");
    expect(localizedName({ en: "Salon", ar: "صالون" }, "en")).toBe("Salon");
  });

  it("falls back to the other language when the locale is empty", () => {
    expect(localizedName({ en: "", ar: "صالون" }, "en")).toBe("صالون");
    expect(localizedName({ en: "Salon", ar: "" }, "ar")).toBe("Salon");
  });

  it("returns an empty string without a name", () => {
    expect(localizedName(null, "en")).toBe("");
    expect(localizedName(undefined, "ar")).toBe("");
  });
});
