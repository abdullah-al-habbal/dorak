import { SubscriptionInterval } from "@/enums/money/subscription-interval.enum";
import { enumLabel } from "@/lib/core/format/enum-label.util";

/** Singular and plural wording for "per month" / "every 3 months", supplied by the dictionary. */
export interface IntervalWording {
  every: Record<SubscriptionInterval, string>;
  everyMany: Record<SubscriptionInterval, string>;
}

/** "month" for a count of 1, "3 months" otherwise. */
export function intervalLabel(unit: SubscriptionInterval, count: number, wording: IntervalWording): string {
  if (count <= 1) return wording.every[unit];
  return wording.everyMany[unit].replace("{count}", String(count));
}

/** The dictionary label of a feature key, or the localized "Unknown" text (and a dev warning) when the key has none. */
export function featureLabel(key: string, labels: Readonly<Record<string, string>>, unknownLabel: string): string {
  return enumLabel(labels, key, unknownLabel, "brand-feature");
}
