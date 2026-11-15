"use client";

import { useState } from "react";
import type { JSX } from "react";

import { CommissionLedgerPanel } from "@/components/commissions/commission-ledger-panel";
import { CommissionRulesPanel } from "@/components/commissions/commission-rules-panel";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import type { CommissionView } from "@/config/platform/commission.constant";
import { AuthActor } from "@/enums/access/auth-actor.enum";
import { useI18n } from "@/hooks/core/state/use-i18n";

/** Platform commission: the rules that set it and the ledger of what was charged. Admin only. */
export function CommissionsScreen({ actor }: { actor: AuthActor }): JSX.Element {
  const { dictionary } = useI18n();
  const t = dictionary.commissions;
  const [view, setView] = useState<CommissionView>("rules");
  if (actor !== AuthActor.Admin) return <EmptyState variant="forbidden" title={t.states.forbiddenTitle} body={t.states.forbiddenBody} />;
  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-heading text-3xl font-semibold">{t.title}</h1>
      <div role="group" aria-label={t.tabsLabel} className="flex gap-2">
        <Button type="button" size="sm" variant={view === "rules" ? "default" : "outline"} aria-pressed={view === "rules"} onClick={() => setView("rules")}>{t.tabs.rules}</Button>
        <Button type="button" size="sm" variant={view === "ledger" ? "default" : "outline"} aria-pressed={view === "ledger"} onClick={() => setView("ledger")}>{t.tabs.ledger}</Button>
      </div>
      {view === "rules" ? <CommissionRulesPanel /> : <CommissionLedgerPanel />}
    </div>
  );
}
