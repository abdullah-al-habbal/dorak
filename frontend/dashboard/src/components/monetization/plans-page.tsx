"use client";

import { PlanForm } from "@/components/monetization/plan-form";
import { ConfirmActionButton } from "@/components/people/confirm-action-button";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card, CardContent } from "@/components/tailgrids/core/card";
import { Pagination } from "@/components/tailgrids/core/pagination";
import { useDictionary } from "@/hooks/use-dictionary";
import { useMonetizationMutation } from "@/hooks/use-monetization-mutation";
import { apiErrorMessage } from "@/services/api/core/api-error-message.util";
import { MONETIZATION_QUERY_KEYS } from "@/services/api/dashboard/monetization/monetization.constant";
import {
  deletePlan,
  getPlans,
  pagedQueryKey,
} from "@/services/api/dashboard/monetization/monetization.query";
import { formatMinorUnits } from "@/services/api/dashboard/monetization/monetization.util";
import type { IPlan } from "@/services/api/dashboard/monetization/types/imonetization.types";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export function PlansPage() {
  const dictionary = useDictionary();
  const copy = dictionary.monetization;
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<IPlan | null>(null);
  const list = useQuery({
    queryKey: pagedQueryKey(MONETIZATION_QUERY_KEYS.plans, page),
    queryFn: () => getPlans(page),
  });
  const remove = useMonetizationMutation(deletePlan, {
    successMessage: copy.deleted,
  });

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold text-title-50">
        {copy.plans.title}
      </h1>
      <Card>
        <CardContent className="space-y-3 pt-4">
          <h2 className="text-lg font-semibold text-title-50">
            {editing ? copy.plans.editTitle : copy.plans.create}
          </h2>
          <PlanForm
            key={editing?.id ?? "new"}
            plan={editing ?? undefined}
            onDone={() => setEditing(null)}
          />
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
        {list.data?.items.map((plan) => (
          <li key={plan.id}>
            <Card>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-4 text-sm">
                <div>
                  <strong>{plan.name.en || plan.name.ar}</strong>
                  <p className="text-text-secondary">
                    {formatMinorUnits(
                      plan.priceMinor,
                      plan.currency?.code ?? "",
                    )}{" "}
                    / {plan.intervalCount} {copy.plans.units[plan.intervalUnit]}
                  </p>
                  <p className="text-text-secondary">
                    {plan.featureKeys.length > 0
                      ? plan.featureKeys.join(", ")
                      : copy.plans.noFeatures}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>{plan.isActive ? copy.active : copy.inactive}</Badge>
                  <Button
                    size="sm"
                    appearance="outline"
                    onPress={() => setEditing(plan)}
                  >
                    {copy.edit}
                  </Button>
                  <ConfirmActionButton
                    danger
                    label={copy.delete}
                    title={copy.deleteTitle}
                    body={copy.deleteBody}
                    isPending={remove.isPending}
                    onConfirm={() => remove.mutate(plan.id)}
                  />
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
