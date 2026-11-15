"use client";

import type { JSX } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { SubscriptionCard } from "@/components/subscription/subscription-card";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { AuthActor } from "@/enums/access/auth-actor.enum";
import { useI18n } from "@/hooks/core/state/use-i18n";
import { useSubscriptions } from "@/hooks/plans/subscriptions/use-subscriptions";

export function SubscriptionScreen({ actor }: { actor: AuthActor }): JSX.Element {
  const { dictionary } = useI18n();
  if (actor !== AuthActor.Owner) {
    const { states } = dictionary.subscription;
    return <EmptyState variant="forbidden" title={states.forbiddenTitle} body={states.forbiddenBody} />;
  }
  return <SubscriptionContent />;
}

function SubscriptionContent(): JSX.Element {
  const { dictionary } = useI18n();
  const { subscription: t } = dictionary;
  const query = useSubscriptions();
  const items = query.data ?? [];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-semibold">{t.title}</h1>
        <p className="max-w-prose text-sm text-muted-foreground">{t.description}</p>
      </div>
      {query.isPending ? <TableSkeleton /> : null}
      {query.isError ? <ErrorState title={t.states.errorTitle} body={t.states.errorBody} onRetry={() => query.refetch()} /> : null}
      {query.data && items.length === 0 ? <EmptyState title={t.states.emptyTitle} body={t.states.emptyBody} /> : null}
      {items.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((subscription) => (
            <SubscriptionCard key={subscription.id} subscription={subscription} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
