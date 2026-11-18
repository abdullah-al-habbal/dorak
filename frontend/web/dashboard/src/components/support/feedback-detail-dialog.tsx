"use client";

import { useState } from "react";
import type { FormEvent, JSX, ReactNode } from "react";

import { LoadingButton } from "@/components/buttons/loading-button";
import { FormErrorBanner } from "@/components/common/form-error-banner";
import { FormField } from "@/components/common/form-field";
import { FeedbackStatusBadge } from "@/components/support/feedback-status-badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { FEEDBACK_NOTE_MAX } from "@/config/support/feedback.constant";
import { FeedbackStatus } from "@/enums/support/feedback-status.enum";
import { useI18n } from "@/hooks/core/state/use-i18n";
import { useUpdateFeedbackReport } from "@/hooks/support/use-update-feedback-report";
import type { FeedbackReport } from "@/types/support/feedback-report.type";

interface FeedbackDetailDialogProps {
  report: FeedbackReport;
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

function toStatus(value: string, fallback: FeedbackStatus): FeedbackStatus {
  return Object.values(FeedbackStatus).find((status) => status === value) ?? fallback;
}

/** One report: the sender's text (escaped), where it came from, and the triage controls. */
export function FeedbackDetailDialog({ report, onClose }: FeedbackDetailDialogProps): JSX.Element {
  const { dictionary, locale } = useI18n();
  const { support: t, common } = dictionary;
  const update = useUpdateFeedbackReport();
  const [status, setStatus] = useState<FeedbackStatus>(report.status);
  const [note, setNote] = useState(report.admin_note ?? "");
  const [error, setError] = useState<string>();
  const { source, related } = report;

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(undefined);
    try {
      await update.mutateAsync({ id: report.id, status, admin_note: note.trim() || null });
      onClose();
    } catch {
      setError(t.dialog.failed);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => (open || update.isPending ? undefined : onClose())}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto overscroll-contain sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t.dialog.title}</DialogTitle>
          <DialogDescription>{t.dialog.description}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">{t.kind[report.kind]}</span>
          <FeedbackStatusBadge status={report.status} />
        </div>
        <section aria-label={t.dialog.message} className="rounded-lg bg-muted/60 p-3">
          <p dir="auto" className="whitespace-pre-wrap break-words text-sm">{report.message}</p>
        </section>
        <dl aria-label={t.dialog.source} className="grid gap-3 sm:grid-cols-2">
          <Field label={t.dialog.sender}>{source.user_type ? `${source.user_type} · ${source.user_id ?? t.none}` : t.guest}</Field>
          <Field label={t.dialog.contact}><span dir="ltr" translate="no">{report.contact_email ?? t.none}</span></Field>
          <Field label={t.columns.app}>{t.app[source.app]} · {t.platform[source.platform]}</Field>
          <Field label={t.dialog.version}><span dir="ltr" translate="no">{source.app_version ?? t.none}</span></Field>
          <Field label={t.dialog.locale}>{source.locale ?? t.none}</Field>
          <Field label={t.dialog.screen}><span dir="ltr" translate="no">{source.screen ?? t.none}</span></Field>
          <Field label={t.dialog.workflow}><span dir="ltr" translate="no">{source.workflow ?? t.none}</span></Field>
          <Field label={t.dialog.relatedTo}>{related ? <span>{t.related[related.type]} · <span dir="ltr" translate="no">{related.id ?? t.none}</span></span> : t.none}</Field>
          <Field label={t.dialog.received}>{report.created_at ? new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(report.created_at)) : t.none}</Field>
        </dl>
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <FormErrorBanner message={error} />
          <FormField id="feedback-status" label={t.dialog.status}>
            <NativeSelect id="feedback-status" value={status} onChange={(event) => setStatus(toStatus(event.target.value, status))}>
              {Object.values(FeedbackStatus).map((value) => (
                <option key={value} value={value}>{t.status[value]}</option>
              ))}
            </NativeSelect>
          </FormField>
          <FormField id="feedback-note" label={t.dialog.note} hint={t.dialog.noteHint}>
            <Textarea id="feedback-note" dir="auto" maxLength={FEEDBACK_NOTE_MAX} value={note} onChange={(event) => setNote(event.target.value)} />
          </FormField>
          <DialogFooter>
            <Button type="button" variant="ghost" disabled={update.isPending} onClick={onClose}>{t.dialog.back}</Button>
            <LoadingButton type="submit" loading={update.isPending} loadingLabel={common.loading}>{t.dialog.save}</LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
