import { describe, expect, it } from "vitest";
import { getRequestDictionary } from "@/i18n/request-dictionary.util";

describe("getRequestDictionary", () => {
  it("uses the validated locale cookie before the language header", () => {
    const request = new Request("http://localhost", {
      headers: {
        cookie: "NEXT_LOCALE=ar",
        "accept-language": "en-US,en;q=0.9",
      },
    });

    expect(getRequestDictionary(request).public.admin).toBe("بوابة المدير");
  });

  it("falls back to the highest priority supported language", () => {
    const request = new Request("http://localhost", {
      headers: { "accept-language": "fr;q=0.3,ar;q=0.9" },
    });

    expect(getRequestDictionary(request).public.admin).toBe("بوابة المدير");
  });

  it("uses English when there is no supported preference", () => {
    const request = new Request("http://localhost", {
      headers: { "accept-language": "fr-FR,fr;q=0.9" },
    });

    expect(getRequestDictionary(request).public.admin).toBe("Admin portal");
  });
});
