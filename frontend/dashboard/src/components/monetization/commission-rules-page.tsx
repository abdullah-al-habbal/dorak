"use client";

import { CommissionRuleForm } from "@/components/monetization/commission-rule-form";
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
  deleteCommissionRule,
  getCommissionEntries,
  getCommissionRules,
  pagedQueryKey,
} from "@/services/api/dashboard/monetization/monetization.query";
import {
  basisPointsToPercent,
  formatMinorUnits,
} from "@/services/api/dashboard/monetization/monetization.util";
import type { ICommissionRule } from "@/services/api/dashboard/monetization/types/imonetization.types";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

function ruleValue(rule: ICommissionRule): string {
  return rule.type === "percent"
    ? `${basisPointsToPercent(rule.value)}%`
    : formatMinorUnits(rule.value, rule.currency?.code ?? "");
}

export function CommissionRulesPage() {
  const dictionary = useDictionary();
  const copy = dictionary.monetization;
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<ICommissionRule | null>(null);
  const rules = useQuery({
    queryKey: pagedQueryKey(MONETIZATION_QUERY_KEYS.rules, page),
    queryFn: () => getCommissionRules(page),
  });
  const entries = useQuery({
    queryKey: pagedQueryKey(MONETIZATION_QUERY_KEYS.entries, 1),
    queryFn: () => getCommissionEntries(1),
  });
  const remove = useMonetizationMutation(deleteCommissionRule, {
    successMessage: copy.deleted,
  });

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold text-title-50">
        {copy.rules.title}
      </h1>
      <Card>
        <CardContent className="space-y-3 pt-4">
          <h2 className="text-lg font-semibold text-title-50">
            {editing ? copy.rules.editTitle : copy.rules.create}
          </h2>
          <CommissionRuleForm
            key={editing?.id ?? "new"}
            rule={editing ?? undefined}
            onDone={() => setEditing(null)}
          />
        </CardContent>
      </Card>
      {rules.isPending ? (
        <p className="text-text-secondary">{copy.loading}</p>
      ) : null}
      {rules.isError ? (
        <p role="alert">{apiErrorMessage(rules.error, dictionary)}</p>
      ) : null}
      {rules.data?.items.length === 0 ? (
        <p className="text-text-secondary">{copy.empty}</p>
      ) : null}
      <ul className="space-y-3">
        {rules.data?.items.map((rule) => (
          <li key={rule.id}>
            <Card>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-4 text-sm">
                <div>
                  <strong>
                    {copy.rules.scopes[rule.scope]} · {ruleValue(rule)}
                  </strong>
                  <p className="text-text-secondary">
                    {copy.rules.types[rule.type]}
                    {rule.scopeId ? ` · ${rule.scopeId}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>{rule.isActive ? copy.active : copy.inactive}</Badge>
                  <Button
                    size="sm"
                    appearance="outline"
                    onPress={() => setEditing(rule)}
                  >
                    {copy.edit}
                  </Button>
                  <ConfirmActionButton
                    danger
                    label={copy.delete}
                    title={copy.deleteTitle}
                    body={copy.deleteBody}
                    isPending={remove.isPending}
                    onConfirm={() => remove.mutate(rule.id)}
                  />
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
      {rules.data ? (
        <Pagination
          currentPage={rules.data.pagination.currentPage}
          totalPages={rules.data.pagination.totalPages}
          onPageChange={setPage}
          labels={dictionary.common.pagination}
        />
      ) : null}
      <h2 className="text-xl font-semibold text-title-50">
        {copy.rules.entries}
      </h2>
      <ul className="space-y-2">
        {entries.data?.items.map((entry) => (
          <li key={entry.id}>
            <Card>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-4 text-sm">
                <span>
                  {copy.rules.base}:{" "}
                  {formatMinorUnits(entry.baseMinor, entry.currencyCode)} ·{" "}
                  {copy.rules.commission}:{" "}
                  {formatMinorUnits(entry.commissionMinor, entry.currencyCode)}
                </span>
                <Badge>
                  {entry.settled ? copy.rules.settled : copy.rules.pending}
                </Badge>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}
