import { EarningsSchema } from "@/services/api/dashboard/earnings/schemas/earnings.schema";
import type { IEarnings } from "@/services/api/dashboard/earnings/types/iearnings.types";
import { isRecord } from "@/utils/guards.util";

function num(value: unknown): number {
  return typeof value === "number" ? value : 0;
}
function nullableNum(value: unknown): number | null {
  return typeof value === "number" ? value : null;
}

export function mapEarnings(wire: unknown): IEarnings {
  const item = isRecord(wire) ? wire : {};
  const totals = Array.isArray(item.totals) ? item.totals : [];
  return EarningsSchema.parse({
    scope: item.scope,
    totals: totals.map((entry) => {
      const total = isRecord(entry) ? entry : {};
      return {
        currencyCode:
          typeof total.currency_code === "string" ? total.currency_code : "",
        grossMinor: num(total.gross_minor),
        commissionMinor: nullableNum(total.commission_minor),
        netMinor: nullableNum(total.net_minor),
        completedBookingsCount: num(total.completed_bookings_count),
      };
    }),
  });
}
