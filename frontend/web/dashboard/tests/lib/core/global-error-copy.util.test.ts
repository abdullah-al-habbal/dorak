import { describe, expect, it } from "vitest";

import { globalErrorView } from "@/lib/global-error-copy.util";

describe("globalErrorView", () => {
  it("uses the saved locale cookie first, with its direction", () => {
    const view = globalErrorView("ar", "en-US");
    expect(view).toMatchObject({ locale: "ar", direction: "rtl", title: "حدث خطأ ما" });
  });

  it("falls back to the browser language, then English", () => {
    expect(globalErrorView(undefined, "ar-SY,ar;q=0.9").locale).toBe("ar");
    expect(globalErrorView(undefined, undefined)).toMatchObject({ locale: "en", direction: "ltr", title: "Something went wrong" });
  });
});
