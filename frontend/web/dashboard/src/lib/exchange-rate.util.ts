import type { ExchangeRate } from "@/types/platform/currency-admin.type";

/** For each pair, the newest rate that has already taken effect: the one the converter uses. */
export function currentRateIds(rates: readonly ExchangeRate[], now: Date): Set<string> {
  const best = new Map<string, ExchangeRate>();
  for (const rate of rates) {
    if (!rate.effective_at || new Date(rate.effective_at) > now) continue;
    const key = `${rate.from_currency_code}>${rate.to_currency_code}`;
    const held = best.get(key);
    if (!held || new Date(rate.effective_at) > new Date(held.effective_at ?? 0)) best.set(key, rate);
  }
  return new Set([...best.values()].map((rate) => rate.id));
}
