"use client";

import { PlusIcon } from "lucide-react";
import { useState } from "react";
import type { JSX } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PaginationBar } from "@/components/ui/table/pagination-bar";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { CommissionType } from "@/enums/commission.enum";
import { OverlayKind } from "@/enums/overlay-kind.enum";
import { useBranchOptions } from "@/hooks/branches/use-branch-options";
import { useBrandOptions } from "@/hooks/brands/use-brand-options";
import { useCommissionRules } from "@/hooks/earnings/use-commissions";
import { useI18n } from "@/hooks/core/use-i18n";
import { useOverlay } from "@/hooks/core/use-overlay";
import { localizedText } from "@/lib/booking-format.util";
import { bpsToPercent, money } from "@/lib/commission.util";
import type { CommissionRule } from "@/types/earnings/commission.type";

const FIRST_PAGE = 1;

/** The rules that set the platform's commission. The most specific active rule (branch, then brand, then global) wins. */
export function CommissionRulesPanel(): JSX.Element {
  const { dictionary, locale } = useI18n();
  const t = dictionary.commissions;
  const overlay = useOverlay();
  const brands = useBrandOptions();
  const branches = useBranchOptions(true);
  const [page, setPage] = useState(FIRST_PAGE);
  const query = useCommissionRules(page);
  const items = query.data?.items ?? [];

  function target(rule: CommissionRule): string {
    if (rule.scope === "global" || rule.scope_id === null) return t.scope.global;
    const name = rule.scope === "brand" ? localizedText(brands.data?.find((brand) => brand.id === rule.scope_id)?.name, locale) : branches.data?.find((branch) => branch.id === rule.scope_id)?.name;
    return `${t.scope[rule.scope]}: ${name || rule.scope_id}`;
  }

  function value(rule: CommissionRule): string {
    if (rule.type === CommissionType.Percent) return `${bpsToPercent(rule.value_bps ?? 0)}%`;
    return money(rule.value_amount_minor ?? 0, rule.currency?.code ?? "", locale);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button type="button" onClick={() => overlay.open({ kind: OverlayKind.CommissionRuleForm })}>
          <PlusIcon aria-hidden data-icon="inline-start" />
          {t.newRule}
        </Button>
      </div>
      <div aria-busy={query.isFetching} className="flex flex-col gap-4">
        {query.isPending ? <TableSkeleton /> : null}
        {query.isError ? <ErrorState title={t.states.errorTitle} body={t.states.errorBody} onRetry={() => query.refetch()} /> : null}
        {query.data && items.length === 0 ? <EmptyState title={t.states.noRulesTitle} body={t.states.noRulesBody} /> : null}
        {items.length > 0 ? (
          <>
            <ul aria-label={t.tabs.rules} className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
              {items.map((rule) => (
                <li key={rule.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="flex min-w-0 flex-col gap-1">
                    <span dir="auto" className="truncate font-medium">{target(rule)}</span>
                    <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                      <span className="tabular">{`${t.type[rule.type]}: ${value(rule)}`}</span>
                      {rule.notes ? <span dir="auto" className="truncate">{rule.notes}</span> : null}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={rule.is_active ? "success" : "outline"}>{rule.is_active ? t.active : t.inactive}</Badge>
                    <Button type="button" size="sm" variant="outline" onClick={() => overlay.open({ kind: OverlayKind.CommissionRuleForm, rule })}>{t.edit}</Button>
                  </div>
                </li>
              ))}
            </ul>
            {query.data ? <PaginationBar page={query.data.page.current_page} totalPages={query.data.page.total_pages} label={t.tabs.rules} onPageChange={setPage} /> : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
