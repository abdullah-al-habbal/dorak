"use client";

import { Card, CardContent } from "@/components/tailgrids/core/card";
import { useDictionary } from "@/hooks/use-dictionary";
import { apiErrorMessage } from "@/services/api/core/api-error-message.util";
import { EARNINGS_QUERY_KEY } from "@/services/api/dashboard/earnings/earnings.constant";
import { getEarnings } from "@/services/api/dashboard/earnings/earnings.query";
import { formatMinorUnits } from "@/services/api/dashboard/monetization/monetization.util";
import { useQuery } from "@tanstack/react-query";

export function EarningsPage() {
  const dictionary = useDictionary();
  const copy = dictionary.earnings;
  const earnings = useQuery({
    queryKey: EARNINGS_QUERY_KEY,
    queryFn: getEarnings,
  });
  const isStylist = earnings.data?.scope === "barber";

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-title-50">{copy.title}</h1>
        {earnings.data ? (
          <p className="text-sm text-text-secondary">
            {copy.scopes[earnings.data.scope]}
          </p>
        ) : null}
      </div>
      {earnings.isPending ? (
        <p className="text-text-secondary">{copy.loading}</p>
      ) : null}
      {earnings.isError ? (
        <p role="alert">{apiErrorMessage(earnings.error, dictionary)}</p>
      ) : null}
      {earnings.data?.totals.length === 0 ? (
        <p className="text-text-secondary">{copy.empty}</p>
      ) : null}
      <ul className="space-y-3">
        {earnings.data?.totals.map((total) => (
          <li key={total.currencyCode}>
            <Card>
              <CardContent className="grid gap-4 pt-4 text-sm sm:grid-cols-4">
                <Figure
                  label={copy.gross}
                  value={formatMinorUnits(total.grossMinor, total.currencyCode)}
                />
                {isStylist ? (
                  <Figure
                    label={copy.netPay}
                    value={
                      total.netMinor === null
                        ? copy.netUnavailable
                        : formatMinorUnits(total.netMinor, total.currencyCode)
                    }
                  />
                ) : (
                  <>
                    <Figure
                      label={copy.commission}
                      value={formatMinorUnits(
                        total.commissionMinor ?? 0,
                        total.currencyCode,
                      )}
                    />
                    <Figure
                      label={copy.net}
                      value={formatMinorUnits(
                        total.netMinor ?? 0,
                        total.currencyCode,
                      )}
                    />
                  </>
                )}
                <Figure
                  label={copy.bookings}
                  value={String(total.completedBookingsCount)}
                />
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-text-secondary">{label}</p>
      <strong className="text-lg">{value}</strong>
    </div>
  );
}
