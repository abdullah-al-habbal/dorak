"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card, CardContent } from "@/components/tailgrids/core/card";
import { Pagination } from "@/components/tailgrids/core/pagination";
import { useDictionary } from "@/hooks/use-dictionary";
import { useLookupOptionsQuery } from "@/hooks/use-lookup-options-query";
import { useMonetizationMutation } from "@/hooks/use-monetization-mutation";
import { apiErrorMessage } from "@/services/api/core/api-error-message.util";
import {
  MONETIZATION_QUERY_KEYS,
  SUBSCRIPTION_NEXT_STATUSES,
} from "@/services/api/dashboard/monetization/monetization.constant";
import {
  assignSubscription,
  getPlans,
  getSubscriptions,
  pagedQueryKey,
  updateSubscriptionStatus,
} from "@/services/api/dashboard/monetization/monetization.query";
import { assignSubscriptionFormSchema } from "@/services/api/dashboard/monetization/schemas/monetization.schema";
import type { IAssignSubscriptionForm } from "@/services/api/dashboard/monetization/types/imonetization.types";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";

export function SubscriptionsPage() {
  const dictionary = useDictionary();
  const copy = dictionary.monetization;
  const [page, setPage] = useState(1);
  const brands = useLookupOptionsQuery("brands");
  const plans = useQuery({
    queryKey: pagedQueryKey(MONETIZATION_QUERY_KEYS.plans, 1),
    queryFn: () => getPlans(1),
  });
  const list = useQuery({
    queryKey: pagedQueryKey(MONETIZATION_QUERY_KEYS.subscriptions, page),
    queryFn: () => getSubscriptions(page),
  });
  const form = useForm<IAssignSubscriptionForm>({
    resolver: zodResolver(assignSubscriptionFormSchema),
    defaultValues: { brandId: "", planId: "" },
  });
  const assign = useMonetizationMutation(assignSubscription, {
    successMessage: copy.subscriptions.assigned,
    onSuccess: () => form.reset(),
  });
  const move = useMonetizationMutation(updateSubscriptionStatus, {
    successMessage: copy.saved,
  });
  const selectClass =
    "rounded-lg border border-card-border bg-input-background px-4 py-2.5";

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold text-title-50">
        {copy.subscriptions.title}
      </h1>
      <Card>
        <CardContent className="space-y-3 pt-4">
          <h2 className="text-lg font-semibold text-title-50">
            {copy.subscriptions.assign}
          </h2>
          <form
            className="grid gap-4 sm:grid-cols-3"
            onSubmit={form.handleSubmit((value) => assign.mutate(value))}
          >
            <label className="grid gap-1 text-sm text-text-100">
              <span>{copy.subscriptions.brand}</span>
              <select className={selectClass} {...form.register("brandId")}>
                <option value="">{copy.subscriptions.selectBrand}</option>
                {brands.data?.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm text-text-100">
              <span>{copy.subscriptions.plan}</span>
              <select className={selectClass} {...form.register("planId")}>
                <option value="">{copy.subscriptions.selectPlan}</option>
                {plans.data?.items
                  .filter((plan) => plan.isActive)
                  .map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name.en || plan.name.ar}
                    </option>
                  ))}
              </select>
            </label>
            <div className="flex items-end">
              <Button type="submit" isDisabled={assign.isPending}>
                {copy.subscriptions.submit}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
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
        {list.data?.items.map((subscription) => (
          <li key={subscription.id}>
            <Card>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-4 text-sm">
                <div>
                  <strong>{subscription.brandName}</strong>
                  <p className="text-text-secondary">{subscription.planName}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>
                    {copy.subscriptions.statuses[subscription.status]}
                  </Badge>
                  {SUBSCRIPTION_NEXT_STATUSES[subscription.status].map(
                    (status) => (
                      <Button
                        key={status}
                        size="sm"
                        appearance="outline"
                        isDisabled={move.isPending}
                        onPress={() =>
                          move.mutate({ id: subscription.id, status })
                        }
                      >
                        {copy.subscriptions.moveTo}{" "}
                        {copy.subscriptions.statuses[status]}
                      </Button>
                    ),
                  )}
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
