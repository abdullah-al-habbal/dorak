type FieldType = "string" | "number" | "boolean" | "object";

/** Non-null, non-array object whose keys can be inspected safely. */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Narrow an untrusted value to one member of an `as const` list. */
export function isOneOf<const TValues extends readonly unknown[]>(
  values: TValues,
  value: unknown,
): value is TValues[number] {
  return values.includes(value);
}

/** Config-driven shape check: every listed field exists with the given `typeof`. */
export function hasFieldTypes(
  value: unknown,
  fields: Readonly<Record<string, FieldType>>,
): value is Record<string, unknown> {
  return (
    isRecord(value) &&
    Object.entries(fields).every(([key, type]) => typeof value[key] === type)
  );
}
