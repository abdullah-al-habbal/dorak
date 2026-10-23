/** Dictionary key for a form field path: `description.en` → `descriptionEn`. */
export function fieldLabelKey(field: string): string {
  return field.replace(
    /\.(en|ar)$/,
    (_, locale: string) => locale.charAt(0).toUpperCase() + locale.slice(1),
  );
}

/** A localized pair with empty strings turned into nulls for optional text. */
export function emptyToNull(value: unknown): {
  en: string | null;
  ar: string | null;
} {
  const pair = (value ?? {}) as Record<string, unknown>;
  const text = (item: unknown) =>
    typeof item === "string" && item !== "" ? item : null;
  return { en: text(pair.en), ar: text(pair.ar) };
}
