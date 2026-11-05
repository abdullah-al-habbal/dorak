"use client";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardContent } from "@/components/tailgrids/core/card";
import { useDictionary } from "@/hooks/use-dictionary";
import { apiErrorMessage } from "@/services/api/core/api-error-message.util";
import { formatMinorUnits } from "@/services/api/dashboard/monetization/monetization.util";
import { OWNER_BILLING_QUERY_KEYS } from "@/services/api/dashboard/owner-billing/owner-billing.constant";
import { getOwnerSubscriptions } from "@/services/api/dashboard/owner-billing/owner-billing.query";
import { useQuery } from "@tanstack/react-query";

export function OwnerSubscriptionPage() {
  const dictionary = useDictionary();
  const copy = dictionary.ownerBilling;
  const list = useQuery({
    queryKey: OWNER_BILLING_QUERY_KEYS.subscription,
    queryFn: getOwnerSubscriptions,
  });

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold text-title-50">
        {copy.subscriptionTitle}
      </h1>
      {list.isPending ? (
        <p className="text-text-secondary">{dictionary.earnings.loading}</p>
      ) : null}
      {list.isError ? (
        <p role="alert">{apiErrorMessage(list.error, dictionary)}</p>
      ) : null}
      {list.data?.length === 0 ? (
        <p className="text-text-secondary">{copy.subscriptionEmpty}</p>
      ) : null}
      <ul className="space-y-3">
        {list.data?.map((subscription) => (
          <li key={subscription.id}>
            <Card>
              <CardContent className="space-y-2 pt-4 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong>{subscription.brandName}</strong>
                  <Badge>{copy.statuses[subscription.status]}</Badge>
                </div>
                <p>
                  {copy.plan}: {subscription.planName} · {copy.price}:{" "}
                  {formatMinorUnits(
                    subscription.priceMinor,
                    subscription.currencyCode,
                  )}{" "}
                  {copy.every} {subscription.intervalCount}{" "}
                  {copy.intervals[subscription.intervalUnit]}
                </p>
                {subscription.endsAt ? (
                  <p className="text-text-secondary">
                    {copy.renews}: {subscription.endsAt.slice(0, 10)}
                  </p>
                ) : null}
                {subscription.graceEndsAt ? (
                  <p role="status">
                    {copy.graceEnds}: {subscription.graceEndsAt.slice(0, 10)}
                  </p>
                ) : null}
                <p className="text-text-secondary">
                  {copy.features}:{" "}
                  {subscription.featureKeys.length === 0
                    ? copy.noFeatures
                    : subscription.featureKeys.join(", ")}
                </p>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}
