import {
  BASIS_POINTS_PER_PERCENT,
  MINOR_UNITS_PER_MAJOR,
} from "@/services/api/dashboard/monetization/monetization.constant";
import type { ICommissionRule } from "@/services/api/dashboard/monetization/types/icommission-rule.types";

export function toMinorUnits(major: number): number {
  return Math.round(major * MINOR_UNITS_PER_MAJOR);
}

export function fromMinorUnits(minor: number): number {
  return minor / MINOR_UNITS_PER_MAJOR;
}

export function formatMinorUnits(minor: number, currencyCode: string): string {
  return `${fromMinorUnits(minor).toFixed(2)} ${currencyCode}`.trim();
}

export function percentToBasisPoints(percent: number): number {
  return Math.round(percent * BASIS_POINTS_PER_PERCENT);
}

/** The stored rule value for its type: basis points for percent, minor units for flat. */
export function commissionRuleStoredValue(rule: ICommissionRule): number {
  return (rule.type === "percent" ? rule.valueBps : rule.valueAmountMinor) ?? 0;
}

export function basisPointsToPercent(basisPoints: number): number {
  return basisPoints / BASIS_POINTS_PER_PERCENT;
}

/** Parses `key=value` lines into a config object; blank lines are ignored. */
export function parseConfigLines(lines: string): Record<string, string> {
  return Object.fromEntries(
    lines
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.includes("="))
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
      })
      .filter(([key]) => key !== ""),
  );
}
