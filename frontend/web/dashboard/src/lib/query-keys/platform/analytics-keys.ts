import { createQueryKeys } from "@/lib/create-query-keys.util";
import type { EarningsRange } from "@/types/earnings/earnings-range.type";

export const analyticsKeys = createQueryKeys("platform-analytics", {
  range: (range: EarningsRange) => [range.from, range.to] as const,
});
