"use client";

import { PlusIcon } from "lucide-react";
import type { JSX } from "react";

import { ErrorState } from "@/components/common/error-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { OverlayKind } from "@/enums/ui/overlay-kind.enum";
import { useI18n } from "@/hooks/core/state/use-i18n";
import { useOverlay } from "@/hooks/core/state/use-overlay";
import { usePaymentGateways, useSetPaymentGatewayActive } from "@/hooks/platform/settings/use-payment-gateways";
import { localizedText } from "@/lib/core/format/booking-format.util";

/** The payment gateways. Credentials are write-only: the list shows which keys are set, never their values. */
export function PaymentGatewaysSection(): JSX.Element {
  const { dictionary, locale } = useI18n();
  const t = dictionary.settings.gateways;
  const overlay = useOverlay();
  const query = usePaymentGateways();
  const toggle = useSetPaymentGatewayActive();
  const items = query.data ?? [];

  return (
    <section aria-labelledby="gateways-heading" className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 id="gateways-heading" className="font-heading text-xl font-semibold">{t.title}</h2>
          <p className="max-w-prose text-sm text-muted-foreground">{t.description}</p>
        </div>
        <Button type="button" onClick={() => overlay.open({ kind: OverlayKind.PaymentGatewayForm })}>
          <PlusIcon aria-hidden data-icon="inline-start" />
          {t.add}
        </Button>
      </div>
      <div aria-busy={query.isFetching}>
        {query.isPending ? <TableSkeleton /> : null}
        {query.isError ? <ErrorState title={t.errorTitle} body={t.errorBody} onRetry={() => query.refetch()} /> : null}
        {query.data && items.length === 0 ? <p className="text-sm text-muted-foreground">{t.empty}</p> : null}
        {items.length > 0 ? (
          <ul aria-label={t.title} className="flex flex-col divide-y divide-border">
            {items.map((gateway) => (
              <li key={gateway.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span dir="auto" className="font-medium">{localizedText(gateway.name, locale)}</span>
                    <span dir="ltr" className="tabular text-sm text-muted-foreground">{gateway.code}</span>
                    {gateway.is_default ? <Badge variant="info">{t.default}</Badge> : null}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {gateway.gateway_setting_keys.length > 0 ? t.configured.replace("{keys}", gateway.gateway_setting_keys.join(", ")) : t.noCredentials}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={gateway.is_active}
                    disabled={toggle.isPending}
                    aria-label={(gateway.is_active ? t.switchOff : t.switchOn).replace("{name}", localizedText(gateway.name, locale))}
                    onCheckedChange={(checked) => toggle.mutate({ id: gateway.id, active: checked })}
                  />
                  <Button type="button" size="sm" variant="outline" onClick={() => overlay.open({ kind: OverlayKind.PaymentGatewayForm, gateway })}>{t.edit}</Button>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
