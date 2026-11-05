"use client";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardContent } from "@/components/tailgrids/core/card";
import { Pagination } from "@/components/tailgrids/core/pagination";
import { useDictionary } from "@/hooks/use-dictionary";
import { apiErrorMessage } from "@/services/api/core/api-error-message.util";
import { formatMinorUnits } from "@/services/api/dashboard/monetization/monetization.util";
import { OWNER_BILLING_QUERY_KEYS } from "@/services/api/dashboard/owner-billing/owner-billing.constant";
import { getOwnerPayouts } from "@/services/api/dashboard/owner-billing/owner-billing.query";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export function OwnerPayoutsPage() {
  const dictionary = useDictionary();
  const copy = dictionary.ownerBilling;
  const [page, setPage] = useState(1);
  const list = useQuery({
    queryKey: [...OWNER_BILLING_QUERY_KEYS.payouts, page],
    queryFn: () => getOwnerPayouts(page),
  });

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold text-title-50">
        {copy.payoutsTitle}
      </h1>
      {list.isPending ? (
        <p className="text-text-secondary">{dictionary.earnings.loading}</p>
      ) : null}
      {list.isError ? (
        <p role="alert">{apiErrorMessage(list.error, dictionary)}</p>
      ) : null}
      {list.data?.items.length === 0 ? (
        <p className="text-text-secondary">{copy.payoutsEmpty}</p>
      ) : null}
      <ul className="space-y-3">
        {list.data?.items.map((payout) => (
          <li key={payout.id}>
            <Card>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-4 text-sm">
                <div>
                  <strong>{payout.brandName}</strong>
                  <p className="text-text-secondary">
                    {copy.total}:{" "}
                    {formatMinorUnits(payout.totalMinor, payout.currencyCode)}
                    {payout.externalReference
                      ? ` · ${copy.reference}: ${payout.externalReference}`
                      : ""}
                    {payout.paidAt
                      ? ` · ${copy.paidAt}: ${payout.paidAt.slice(0, 10)}`
                      : ""}
                  </p>
                  <p className="text-text-secondary">
                    {copy.directions[
                      payout.direction as keyof typeof copy.directions
                    ] ?? payout.direction}
                  </p>
                </div>
                <Badge>{copy.payoutStatuses[payout.status]}</Badge>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
      {list.data ? (
        <Pagination
          currentPage={list.data.pagination.currentPage}
          totalPages={list.data.pagination.totalPages}
          onPageChange={setPage}
          labels={dictionary.common.pagination}
        />
      ) : null}
    </section>
  );
}
