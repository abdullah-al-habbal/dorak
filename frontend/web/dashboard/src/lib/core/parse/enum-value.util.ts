/** Any string enum object, for example `BookingStatus`. */
type StringEnum<T extends string> = Record<string, T>;

/** Narrows an untrusted string (URL param, `<select>` value, API field) to a member of the enum, or `undefined`. */
export function parseEnumValue<T extends string>(enumObject: StringEnum<T>, value: string | null | undefined): T | undefined {
  return Object.values(enumObject).find((member) => member === value);
}

/** The type-guard form of {@link parseEnumValue}. */
export function isEnumValue<T extends string>(enumObject: StringEnum<T>, value: unknown): value is T {
  return typeof value === "string" && parseEnumValue(enumObject, value) !== undefined;
}
