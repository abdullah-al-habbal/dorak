"use client";

import type { JSX, ReactNode } from "react";

import { BarberStatusBadge } from "@/components/barber-approvals/barber-status-badge";
import { useI18n } from "@/hooks/core/use-i18n";
import type { BarberApproval } from "@/types/stylists/barber-approval.type";

function Field({ label, children }: { label: string; children: ReactNode }): JSX.Element {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words text-sm">{children}</dd>
    </div>
  );
}

function translation(value: BarberApproval["name"] | BarberApproval["bio"], locale: string): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[locale] ?? "";
}

/** What the reviewer needs before deciding. Server strings render as text, never as markup. */
export function BarberApprovalFields({ barber }: { barber: BarberApproval }): JSX.Element {
  const { dictionary, locale } = useI18n();
  const { barberApprovals: t } = dictionary;
  const none = t.none;
  const created = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(barber.created_at));

  return (
    <div className="flex flex-col gap-4">
      <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
        <Field label={t.detail.nameEn}><span dir="auto">{translation(barber.name, "en") || none}</span></Field>
        <Field label={t.detail.nameAr}><span dir="auto">{translation(barber.name, "ar") || none}</span></Field>
        <Field label={t.detail.status}><BarberStatusBadge status={barber.status} /></Field>
        <Field label={t.detail.email}><span dir="ltr" translate="no">{barber.email ?? none}</span></Field>
        <Field label={t.detail.phone}><span dir="ltr" translate="no">{barber.phone ?? none}</span></Field>
        <Field label={t.detail.emailVerified}>{barber.email_verified_at ? t.detail.yes : t.detail.no}</Field>
        <Field label={t.detail.freelancer}>{barber.is_freelancer ? t.detail.yes : t.detail.no}</Field>
        <Field label={t.detail.submissions}>
          <span className="tabular">{barber.submission_count ?? none}{barber.max_submissions ? ` / ${barber.max_submissions}` : ""}</span>
        </Field>
        <Field label={t.detail.created}><span className="tabular">{created}</span></Field>
        <div className="sm:col-span-2">
          <Field label={t.detail.bio}><span dir="auto">{translation(barber.bio, locale) || none}</span></Field>
        </div>
        {barber.rejection_reason ? (
          <div className="sm:col-span-2">
            <Field label={t.detail.rejectionReason}><span dir="auto">{barber.rejection_reason}</span></Field>
          </div>
        ) : null}
      </dl>
      <section aria-label={t.detail.portfolio} className="flex flex-col gap-2">
        <h3 className="text-xs text-muted-foreground">{t.detail.portfolio}</h3>
        {barber.portfolio && barber.portfolio.length > 0 ? (
          <ul className="grid grid-cols-3 gap-2">
            {barber.portfolio.map((photo, index) => (
              <li key={photo.id}>
                {/* eslint-disable-next-line @next/next/no-img-element -- user-uploaded storage URL, not a build-time asset */}
                <img src={photo.url} alt={t.detail.photoAlt.replace("{n}", String(index + 1))} loading="lazy" className="aspect-square w-full rounded-lg object-cover" />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">{t.detail.noPortfolio}</p>
        )}
      </section>
    </div>
  );
}
