import type { EarningsRange } from "@/types/earnings-range.type";

export const analyticsKeys = {
  all: ["platform-analytics"] as const,
  range: (range: EarningsRange) => ["platform-analytics", range.from, range.to] as const,
};
