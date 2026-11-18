import { TESTIMONIALS_SECTION_TYPE } from "@/config/platform/website-content.constant";
import type { TestimonialSectionOption } from "@/types/platform/content/testimonial-section-option.type";
import type { ContentPage } from "@/types/platform/website-content.type";

/** Reads one locale of a translatable map; the API returns `[]` when a field was never set. */
export function localeText(value: unknown, locale: "en" | "ar"): string {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return "";
  const text = (value as Record<string, unknown>)[locale];
  return typeof text === "string" ? text : "";
}

/** The structured body of one locale as editable JSON. */
export function bodyJson(body: unknown, locale: "en" | "ar"): string {
  if (typeof body !== "object" || body === null || Array.isArray(body)) return "{}";
  const part = (body as Record<string, unknown>)[locale];
  return JSON.stringify(typeof part === "object" && part !== null && !Array.isArray(part) ? part : {}, null, 2);
}

/** Parses a JSON object; anything else (including arrays and scalars) is `undefined`. */
export function parseBodyObject(text: string): Record<string, unknown> | undefined {
  try {
    const parsed: unknown = JSON.parse(text);
    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : undefined;
  } catch {
    return undefined;
  }
}

/** The headline and the supporting line of a section body, for the preview. */
export function bodyPreview(body: Record<string, unknown>): { heading: string; subheading: string } {
  const read = (key: string): string => (typeof body[key] === "string" ? body[key] : "");
  return { heading: read("heading"), subheading: read("subheading") };
}

/** Which languages still lack text on a page: its title, or the body of any section. A page needs both to be published. */
export function missingLocales(page: ContentPage): Array<"en" | "ar"> {
  const locales: Array<"en" | "ar"> = ["en", "ar"];
  return locales.filter((locale) => {
    const noTitle = localeText(page.title, locale).trim() === "";
    const noSectionText = page.sections.length === 0 || page.sections.some((section) => bodyJson(section.body, locale) === "{}");
    return noTitle || noSectionText;
  });
}

/** The testimonial sections an editor can pick, labelled `/slug · title` (the type stands in for an untitled section). */
export function testimonialSectionOptions(pages: readonly ContentPage[], locale: "en" | "ar"): TestimonialSectionOption[] {
  return pages.flatMap((page) =>
    page.sections
      .filter((section) => section.section_type === TESTIMONIALS_SECTION_TYPE)
      .map((section) => ({ id: section.id, label: `/${page.slug} · ${localeText(section.title, locale) || section.section_type}` })),
  );
}
