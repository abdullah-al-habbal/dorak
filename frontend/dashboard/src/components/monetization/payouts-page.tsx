"use client";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card, CardContent } from "@/components/tailgrids/core/card";
import { Pagination } from "@/components/tailgrids/core/pagination";
import { useDictionary } from "@/hooks/use-dictionary";
import { useMonetizationMutation } from "@/hooks/use-monetization-mutation";
import { apiErrorMessage } from "@/services/api/core/api-error-message.util";
import {
  MONETIZATION_QUERY_KEYS,
  PAYOUT_NEXT_ACTIONS,
} from "@/services/api/dashboard/monetization/monetization.constant";
import {
  generatePayouts,
  getPayouts,
  pagedQueryKey,
  transitionPayout,
} from "@/services/api/dashboard/monetization/monetization.query";
import { formatMinorUnits } from "@/services/api/dashboard/monetization/monetization.util";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export function PayoutsPage() {
  const dictionary = useDictionary();
  const copy = dictionary.monetization;
  const [page, setPage] = useState(1);
  const list = useQuery({
    queryKey: pagedQueryKey(MONETIZATION_QUERY_KEYS.payouts, page),
    queryFn: () => getPayouts(page),
  });
  const generate = useMonetizationMutation<unknown, void>(generatePayouts, {
    successMessage: copy.payouts.generated,
  });
  const transition = useMonetizationMutation(transitionPayout, {
    successMessage: copy.payouts.updated,
  });

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-title-50">
          {copy.payouts.title}
        </h1>
        <Button
          isDisabled={generate.isPending}
          onPress={() => generate.mutate()}
        >
          {copy.payouts.generate}
        </Button>
      </div>
      {list.isPending ? (
        <p className="text-text-secondary">{copy.loading}</p>
      ) : null}
      {list.isError ? (
        <p role="alert">{apiErrorMessage(list.error, dictionary)}</p>
      ) : null}
      {list.data?.items.length === 0 ? (
        <p className="text-text-secondary">{copy.empty}</p>
      ) : null}
      <ul className="space-y-3">
        {list.data?.items.map((payout) => (
          <li key={payout.id}>
            <Card>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-4 text-sm">
                <div>
                  <strong>{payout.brandName}</strong>
                  <p className="text-text-secondary">
                    {copy.payouts.total}:{" "}
                    {formatMinorUnits(payout.totalMinor, payout.currencyCode)}
                    {payout.reference
                      ? ` · ${copy.payouts.reference}: ${payout.reference}`
                      : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{copy.payouts.statuses[payout.status]}</Badge>
                  {PAYOUT_NEXT_ACTIONS[payout.status].map((action) => (
                    <Button
                      key={action}
                      size="sm"
                      appearance="outline"
                      isDisabled={transition.isPending}
                      onPress={() =>
                        transition.mutate({ id: payout.id, action })
                      }
                    >
                      {copy.payouts.actions[action]}
                    </Button>
                  ))}
                </div>
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
