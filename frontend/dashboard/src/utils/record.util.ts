/** Build a total record from an `as const` key list. */
export function mapRecord<const TKey extends PropertyKey, TValue>(
  keys: readonly TKey[],
  toValue: (key: TKey) => TValue,
): Record<TKey, TValue> {
  return Object.fromEntries(keys.map((key) => [key, toValue(key)])) as Record<
    TKey,
    TValue
  >;
}

/** Swap keys and values of a one-to-one record. */
export function invertRecord<
  TKey extends PropertyKey,
  TValue extends PropertyKey,
>(record: Readonly<Record<TKey, TValue>>): Record<TValue, TKey> {
  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => [value, key]),
  ) as Record<TValue, TKey>;
}
