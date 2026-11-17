import type { LocalePair } from "@/types/core/shared/locale-pair.type";

function readLocale(source: Record<string, unknown>, locale: keyof LocalePair): string {
  const text = source[locale];
  return typeof text === "string" ? text : "";
}

/**
 * Reads a translatable API field into both locales. A field that was never set arrives as `null`,
 * `undefined` or `[]` (the API's empty array), and each of them reads as two empty strings.
 */
export function toLocalePair(value: unknown): LocalePair {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return { en: "", ar: "" };
  const source: Record<string, unknown> = { ...value };
  return { en: readLocale(source, "en"), ar: readLocale(source, "ar") };
}
