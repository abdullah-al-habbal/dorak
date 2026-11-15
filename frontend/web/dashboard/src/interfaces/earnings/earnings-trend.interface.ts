import type { TrendDirection } from "@/enums/ui/trend-direction.enum";

export interface EarningsTrend {
  direction: TrendDirection;
  /** Absolute percent change; null when there is no base to compare against. */
  percent: number | null;
}
