const warned = new Set<string>();

/**
 * The localized label for a backend machine key. A key the dictionary does not know
 * shows the localized "Unknown" text instead of the raw value, and warns once per
 * `scope:key` outside production so a new backend case is noticed during development.
 */
export function enumLabel(
  labels: Readonly<Record<string, string>>,
  key: string | null | undefined,
  unknownLabel: string,
  scope: string,
): string {
  if (key != null && Object.hasOwn(labels, key)) return labels[key];
  warnUnknownKey(scope, key);
  return unknownLabel;
}

function warnUnknownKey(scope: string, key: string | null | undefined): void {
  if (process.env.NODE_ENV === "production") return;
  const id = `${scope}:${String(key)}`;
  if (warned.has(id)) return;
  warned.add(id);
  console.warn(`[i18n] No label for ${id}. Add it to the dictionary in both languages.`);
}

/** Test helper: forget which keys already warned. */
export function resetEnumLabelWarnings(): void {
  warned.clear();
}
