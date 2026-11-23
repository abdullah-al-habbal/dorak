"use client";

import type { JSX } from "react";

import { ClientBansSection } from "@/components/clients/client-bans-section";
import { useBarberActivationLog } from "@/hooks/stylists/invite/use-barber-activation-log";
import { useBarberAffiliations } from "@/hooks/stylists/invite/use-barber-affiliations";
import { useI18n } from "@/hooks/core/state/use-i18n";
import { localizedText } from "@/lib/core/format/booking-format.util";
import { enumLabel } from "@/lib/core/format/enum-label.util";
import type { BarberApproval } from "@/types/stylists/barber-approval.type";

/** Ban history, the activation log and the affiliations of one barber. */
export function BarberAccountSections({ barber }: { barber: BarberApproval }): JSX.Element {
  const { dictionary, locale } = useI18n();
  const { barberApprovals: t } = dictionary;
  const log = useBarberActivationLog(barber.id);
  const affiliations = useBarberAffiliations(barber.id);
  const date = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" });
  const when = (value: string | null | undefined): string => (value ? date.format(new Date(value)) : t.none);
  const state = (value: string): string => enumLabel(t.account.states, value, dictionary.common.unknown, "barber-account-state");
  const kind = (value: string): string => enumLabel(t.account.kinds, value, dictionary.common.unknown, "affiliable-type");

  return (
    <>
      <ClientBansSection bans={barber.bans} />
      <section aria-label={t.account.activationLog} className="flex flex-col gap-2">
        <h3 className="text-sm font-medium">{t.account.activationLog}</h3>
        {log.isError ? <p role="alert" className="text-sm text-destructive">{t.account.loadFailed}</p> : null}
        {log.data && log.data.length === 0 ? <p className="text-sm text-muted-foreground">{t.account.noLog}</p> : null}
        <ol className="flex flex-col gap-1.5">
          {log.data?.map((entry) => (
            <li key={entry.id} className="flex flex-col gap-0.5 rounded-lg border border-border px-3 py-2 text-sm">
              <span className="font-medium">{state(entry.status)}</span>
              <span className="tabular text-xs text-muted-foreground">
                {when(entry.activated_at)}
                {entry.activated_by ? ` · ${entry.activated_by}` : ""}
              </span>
              {entry.reason ? <span dir="auto" className="break-words text-muted-foreground">{entry.reason}</span> : null}
            </li>
          ))}
        </ol>
      </section>
      <section aria-label={t.account.affiliations} className="flex flex-col gap-2">
        <h3 className="text-sm font-medium">{t.account.affiliations}</h3>
        {affiliations.isError ? <p role="alert" className="text-sm text-destructive">{t.account.loadFailed}</p> : null}
        {affiliations.data && affiliations.data.length === 0 ? <p className="text-sm text-muted-foreground">{t.account.noAffiliations}</p> : null}
        <ul className="flex flex-col gap-1.5">
          {affiliations.data?.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm">
              <span dir="auto" className="truncate">{localizedText(item.affiliable_name, locale) || t.none}</span>
              <span className="text-muted-foreground">{kind(item.affiliable_type)} · {state(item.status)}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
