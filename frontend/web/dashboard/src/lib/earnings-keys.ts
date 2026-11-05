import type { EarningsRange } from "@/types/earnings-range.type";

export const earningsKeys = {
  all: ["earnings"] as const,
  range: (range: EarningsRange) => ["earnings", range.from, range.to] as const,
};
