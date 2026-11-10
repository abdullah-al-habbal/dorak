"use client";

import type { JSX } from "react";

import { useI18n } from "@/hooks/use-i18n";
import type { ClientBan } from "@/types/client-ban.type";

/** Every ban the client has had, newest first, with who set it and when it ended. */
export function ClientBansSection({ bans }: { bans: readonly ClientBan[] | undefined }): JSX.Element {
  const { dictionary, locale } = useI18n();
  const { clients: t } = dictionary;
  const date = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" });
  const when = (value: string | null | undefined): string => (value ? date.format(new Date(value)) : t.none);

  return (
    <section aria-label={t.detail.bans} className="flex flex-col gap-2">
      <h3 className="text-sm font-medium">{t.detail.bans}</h3>
      {bans && bans.length === 0 ? <p className="text-sm text-muted-foreground">{t.detail.noBans}</p> : null}
      {bans && bans.length > 0 ? (
        <ol className="flex flex-col gap-2">
          {bans.map((ban) => (
            <li key={ban.id} className="flex flex-col gap-0.5 rounded-lg border border-border px-3 py-2 text-sm">
              <span className="font-medium">{ban.active ? t.detail.banActive : ban.lifted_at ? t.detail.banLifted : t.detail.banExpired}</span>
              <span className="tabular text-xs text-muted-foreground">
                {when(ban.banned_at)}
                {" → "}
                {ban.expires_at ? when(ban.expires_at) : t.detail.permanent}
                {ban.banned_by ? ` · ${ban.banned_by}` : ""}
              </span>
              {ban.reason ? <span dir="auto" className="break-words text-muted-foreground">{ban.reason}</span> : null}
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  );
}
