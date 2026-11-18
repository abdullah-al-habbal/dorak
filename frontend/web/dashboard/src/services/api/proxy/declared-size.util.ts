/** True when the request announces a body larger than `maxBytes`, so it can be refused before it is buffered. */
export function exceedsDeclaredSize(headers: Pick<Headers, "get">, maxBytes: number): boolean {
  const declared = Number(headers.get("content-length") ?? "");
  return Number.isFinite(declared) && declared > maxBytes;
}
