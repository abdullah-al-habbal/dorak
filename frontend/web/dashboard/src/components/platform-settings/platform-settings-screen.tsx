"use client";

import type { JSX } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { LanguagesSection } from "@/components/platform-settings/languages-section";
import { PaymentGatewaysSection } from "@/components/payment-gateways/payment-gateways-section";
import { PlatformSettingsForm } from "@/components/platform-settings/platform-settings-form";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthActor } from "@/enums/access/auth-actor.enum";
import { useDictionary } from "@/hooks/core/state/use-dictionary";
import { usePlatformSettings } from "@/hooks/platform/settings/use-platform-settings";

/** Platform settings are admin only; the proxy and the backend refuse everyone else too. */
export function PlatformSettingsScreen({ actor }: { actor: AuthActor }): JSX.Element {
  const { settings: t } = useDictionary();
  if (actor !== AuthActor.Admin) {
    return <EmptyState variant="forbidden" title={t.states.forbiddenTitle} body={t.states.forbiddenBody} />;
  }
  return <PlatformSettingsContent />;
}

function PlatformSettingsContent(): JSX.Element {
  const { settings: t } = useDictionary();
  const query = usePlatformSettings();
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-semibold">{t.title}</h1>
        <p className="max-w-prose text-sm text-muted-foreground">{t.description}</p>
      </div>
      <div aria-busy={query.isFetching} className="flex flex-col gap-4">
        {query.isPending ? (
          <div role="status" aria-label={t.states.loading} className="flex flex-col gap-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : null}
        {query.isError && !query.data ? <ErrorState title={t.states.errorTitle} body={t.states.errorBody} onRetry={() => query.refetch()} /> : null}
        {query.data ? <PlatformSettingsForm settings={query.data} /> : null}
      </div>
      <PaymentGatewaysSection />
      <LanguagesSection />
    </div>
  );
}
