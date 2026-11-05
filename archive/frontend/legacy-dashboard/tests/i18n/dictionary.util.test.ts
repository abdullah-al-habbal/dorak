import { describe, expect, it } from "vitest";
import { getDictionary } from "@/i18n/dictionary.util";
import { DEFAULT_LOCALE } from "@/i18n/locales.constant";

function expectSameDictionaryShape(expected: object, actual: object): void {
  expect(Object.keys(actual).sort()).toEqual(Object.keys(expected).sort());

  for (const key of Object.keys(expected)) {
    const expectedValue = expected[key as keyof typeof expected];
    const actualValue = actual[key as keyof typeof actual];
    if (typeof expectedValue === "object" && expectedValue !== null) {
      expect(typeof actualValue).toBe("object");
      expectSameDictionaryShape(expectedValue, actualValue as object);
    } else {
      expect(typeof expectedValue).toBe("string");
      expect(typeof actualValue).toBe("string");
    }
  }
}

describe("dictionary contract", () => {
  it("keeps Arabic dictionary shape identical to English", () => {
    expectSameDictionaryShape(getDictionary("en"), getDictionary("ar"));
    expect(getDictionary(DEFAULT_LOCALE).meta.appName).toBe("Dorak");
  });

  it("has all new common namespaces in both locales", () => {
    const en = getDictionary("en");
    const ar = getDictionary("ar");

    expect(en.common.pagination).toBeDefined();
    expect(ar.common.pagination).toBeDefined();
    expect(en.common.pagination.label).toBe("Pagination");
    expect(ar.common.pagination.label).toBe("ترقيم الصفحات");

    expect(en.common.dialog).toBeDefined();
    expect(ar.common.dialog).toBeDefined();
    expect(en.common.dialog.close).toBe("Close");
    expect(ar.common.dialog.close).toBe("إغلاق");

    expect(en.common.calendar).toBeDefined();
    expect(ar.common.calendar).toBeDefined();
    expect(en.common.calendar.previousMonth).toBe("Previous month");
    expect(ar.common.calendar.previousMonth).toBe("الشهر السابق");

    expect(en.common.sheet).toBeDefined();
    expect(ar.common.sheet).toBeDefined();
    expect(en.common.sheet.close).toBe("Close");
    expect(ar.common.sheet.close).toBe("إغلاق");

    expect(en.common.actions.protocol).toBe("https://");
    expect(ar.common.actions.protocol).toBe("https://");
  });

  it("uses localized actions for active sessions", () => {
    const en = getDictionary("en");
    const ar = getDictionary("ar");

    expect(en.profile.security.viewSessions).toBe("View sessions");
    expect(ar.profile.security.viewSessions).toBe("عرض الجلسات");
  });

  it("drops the retired portal placeholder copy", () => {
    expect(Object.keys(getDictionary("en").portal)).not.toContain(
      "description",
    );
    expect(Object.keys(getDictionary("ar").portal)).not.toContain(
      "description",
    );
  });
});
