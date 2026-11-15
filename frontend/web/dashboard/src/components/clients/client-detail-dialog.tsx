"use client";

import { BanIcon, ShieldOffIcon } from "lucide-react";
import type { JSX, ReactNode } from "react";

import { ClientActivitySection } from "@/components/clients/client-activity-section";
import { ClientBansSection } from "@/components/clients/client-bans-section";
import { ClientStatusBadge } from "@/components/clients/client-status-badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { OverlayKind } from "@/enums/ui/overlay-kind.enum";
import { useClientDetail } from "@/hooks/clients/clients/use-client-detail";
import { useConfirmUnbanClient } from "@/hooks/clients/clients/use-confirm-unban-client";
import { useI18n } from "@/hooks/core/state/use-i18n";
import { useOverlay } from "@/hooks/core/state/use-overlay";
import { localizedText } from "@/lib/core/format/booking-format.util";
import type { AdminClient } from "@/types/clients/clients/admin-client.type";

interface ClientDetailDialogProps {
  client: AdminClient;
  onClose: () => void;
}

function Field({ label, children }: { label: string; children: ReactNode }): JSX.Element {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words text-sm">{children}</dd>
    </div>
  );
}

/** One client for the platform admin: the account, ban history, bookings and reviews, and the ban move. */
export function ClientDetailDialog({ client: initial, onClose }: ClientDetailDialogProps): JSX.Element {
  const { dictionary, locale } = useI18n();
  const { clients: t } = dictionary;
  const overlay = useOverlay();
  const confirmUnban = useConfirmUnbanClient();
  const query = useClientDetail(initial);
  const client = query.data ?? initial;
  const date = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });

  return (
    <Dialog open onOpenChange={(open) => (open ? undefined : onClose())}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto overscroll-contain sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle dir="auto">{localizedText(client.name, locale) || t.detail.title}</DialogTitle>
          <DialogDescription>{t.detail.description}</DialogDescription>
        </DialogHeader>
        {query.isError ? <p role="alert" className="text-sm text-destructive">{t.detail.loadFailed}</p> : null}
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label={t.columns.email}><span dir="ltr" translate="no">{client.email ?? t.none}</span></Field>
          <Field label={t.columns.phone}><span dir="ltr" translate="no">{client.phone ?? t.none}</span></Field>
          <Field label={t.columns.status}><ClientStatusBadge status={client.status} banned={client.is_banned} /></Field>
          <Field label={t.detail.emailVerified}>{client.email_verified_at ? t.detail.yes : t.detail.no}</Field>
          <Field label={t.columns.bookings}><span className="tabular">{client.bookings_count ?? t.none}</span></Field>
          <Field label={t.columns.created}>{client.created_at ? date.format(new Date(client.created_at)) : t.none}</Field>
        </dl>
        <ClientBansSection bans={client.bans} />
        <ClientActivitySection clientId={client.id} />
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>{t.detail.close}</Button>
          {client.is_banned ? (
            <Button type="button" variant="outline" onClick={() => confirmUnban(client)}>
              <ShieldOffIcon aria-hidden data-icon="inline-start" />
              {t.unban.action}
            </Button>
          ) : (
            <Button type="button" variant="outline" onClick={() => overlay.open({ kind: OverlayKind.ClientBan, client })}>
              <BanIcon aria-hidden data-icon="inline-start" />
              {t.ban.action}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
