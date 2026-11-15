const DECIMAL = /^-?\d+(\.\d+)?$/;

/** An empty field is `null` (no coordinate); a number inside `±limit` is itself; anything else is `undefined` (invalid). */
export function parseCoordinate(value: string, limit: number): number | null | undefined {
  const text = value.trim();
  if (text === "") return null;
  if (!DECIMAL.test(text)) return undefined;
  const parsed = Number(text);
  return Math.abs(parsed) <= limit ? parsed : undefined;
}
