import { createQueryKeys } from "@/lib/core/create-query-keys.util";
import type { EarningsRange } from "@/types/earnings/earnings-range.type";

export const earningsKeys = createQueryKeys("earnings", {
  range: (range: EarningsRange) => [range.from, range.to] as const,
});
