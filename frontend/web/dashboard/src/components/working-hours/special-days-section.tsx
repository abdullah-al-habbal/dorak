"use client";

import { Trash2Icon } from "lucide-react";
import { useState } from "react";
import type { FormEvent, JSX } from "react";

import { LoadingButton } from "@/components/buttons/loading-button";
import { FormErrorBanner } from "@/components/common/form-error-banner";
import { FormField } from "@/components/common/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { useClearHoursOverride } from "@/hooks/hours/use-clear-hours-override";
import { useHoursOverrides } from "@/hooks/hours/use-hours-overrides";
import { useI18n } from "@/hooks/core/use-i18n";
import { useSetHoursOverride } from "@/hooks/hours/use-set-hours-override";
import { formatDay } from "@/lib/core/booking-format.util";
import { specialDayInput, specialDayIssue } from "@/lib/hours/hours-override.util";
import type { SpecialDayDraft, SpecialDayKind } from "@/lib/hours/hours-override.util";

const EMPTY_DRAFT: SpecialDayDraft = { date: "", kind: "closed", opens: "", closes: "" };

/** Closure days and shortened days for one branch. A new entry for a date replaces the earlier one. */
export function SpecialDaysSection({ branchId }: { branchId: string }): JSX.Element {
  const { dictionary, locale } = useI18n();
  const t = dictionary.workingHours.specialDays;
  const query = useHoursOverrides(branchId);
  const save = useSetHoursOverride();
  const clear = useClearHoursOverride();
  const [draft, setDraft] = useState<SpecialDayDraft>(EMPTY_DRAFT);
  const [error, setError] = useState<string>();

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(undefined);
    const issue = specialDayIssue(draft);
    if (issue !== undefined) {
      setError(t.issues[issue]);
      return;
    }
    try {
      await save.mutateAsync({ branchId, date: draft.date, input: specialDayInput(draft) });
      setDraft(EMPTY_DRAFT);
    } catch {
      setError(t.toast.failed);
    }
  }

  return (
    <section aria-labelledby="special-days-title" className="flex flex-col gap-4 rounded-xl border border-border p-4">
      <div className="flex flex-col gap-1">
        <h2 id="special-days-title" className="font-heading text-lg font-semibold">{t.title}</h2>
        <p className="text-sm text-muted-foreground">{t.description}</p>
      </div>

      <form onSubmit={submit} noValidate className="flex flex-col gap-3">
        <FormErrorBanner message={error} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <FormField id="special-day-date" label={t.date}>
            <Input id="special-day-date" type="date" dir="ltr" value={draft.date} onChange={(event) => setDraft({ ...draft, date: event.target.value })} />
          </FormField>
          <FormField id="special-day-kind" label={t.kind}>
            <NativeSelect id="special-day-kind" value={draft.kind} onChange={(event) => setDraft({ ...draft, kind: event.target.value as SpecialDayKind })}>
              <option value="closed">{t.closedAllDay}</option>
              <option value="hours">{t.specialHours}</option>
            </NativeSelect>
          </FormField>
          {draft.kind === "hours" ? (
            <>
              <FormField id="special-day-opens" label={dictionary.workingHours.opensAt}>
                <Input id="special-day-opens" type="time" dir="ltr" value={draft.opens} onChange={(event) => setDraft({ ...draft, opens: event.target.value })} />
              </FormField>
              <FormField id="special-day-closes" label={dictionary.workingHours.closesAt}>
                <Input id="special-day-closes" type="time" dir="ltr" value={draft.closes} onChange={(event) => setDraft({ ...draft, closes: event.target.value })} />
              </FormField>
            </>
          ) : null}
        </div>
        <div>
          <LoadingButton type="submit" loading={save.isPending} loadingLabel={dictionary.common.loading}>{t.add}</LoadingButton>
        </div>
      </form>

      {query.isError ? <p role="alert" className="text-sm text-destructive">{t.loadFailed}</p> : null}
      {query.data && query.data.length === 0 ? <p className="text-sm text-muted-foreground">{t.empty}</p> : null}
      <ul className="flex flex-col gap-1.5">
        {query.data?.map((item) => {
          const label = formatDay(new Date(`${item.date}T00:00:00`), locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
          return (
            <li key={item.date} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm">
              <span className="flex flex-col">
                <span className="font-medium">{label}</span>
                <span dir="ltr" className="tabular text-muted-foreground">
                  {item.is_closed ? t.closedAllDay : `${item.opens_time}–${item.closes_time}`}
                </span>
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={t.remove.replace("{date}", label)}
                disabled={clear.isPending}
                onClick={() => clear.mutate({ branchId, date: item.date })}
              >
                <Trash2Icon aria-hidden />
              </Button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
