import { SubscriptionInterval } from "@/enums/subscription-interval.enum";

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

/** `multi_branch` becomes "Multi branch" when the dictionary has no label for the key. */
export function featureLabel(key: string, labels: Record<string, string>): string {
  if (labels[key]) return labels[key];
  const words = key.replace(/_/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}
