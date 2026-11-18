"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2Icon } from "lucide-react";
import { useMemo } from "react";
import type { JSX } from "react";
import { useForm, useWatch } from "react-hook-form";

import { WeekdayPicker } from "@/components/working-hours/weekday-picker";
import { LoadingButton } from "@/components/buttons/loading-button";
import { FormErrorBanner } from "@/components/common/form-error-banner";
import { FormField, fieldErrorId } from "@/components/common/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { useClearHoursOverride } from "@/hooks/hours/use-clear-hours-override";
import { useHoursOverrides } from "@/hooks/hours/use-hours-overrides";
import { useI18n } from "@/hooks/core/state/use-i18n";
import { useSetHoursOverride } from "@/hooks/hours/use-set-hours-override";
import { useSetHoursOverrideRange } from "@/hooks/hours/use-set-hours-override-range";
import { applyFormError } from "@/lib/core/errors/apply-form-error.util";
import { mapApiFormError } from "@/lib/core/errors/map-api-form-error.util";
import { formatDay } from "@/lib/core/format/booking-format.util";
import { EMPTY_SPECIAL_DAY, isRangeDraft, mapSpecialDayFieldName, specialDayInput, specialDayRangeInput } from "@/lib/hours/hours-override.util";
import { createSpecialDayFormSchema } from "@/schemas/hours/special-day-form.zod";
import type { SpecialDayFormValues } from "@/types/hours/special-day-form-values.type";

/** Closure days and shortened days for one branch. A new entry for a date replaces the earlier one. */
export function SpecialDaysSection({ branchId }: { branchId: string }): JSX.Element {
  const { dictionary, locale } = useI18n();
  const t = dictionary.workingHours.specialDays;
  const query = useHoursOverrides(branchId);
  const save = useSetHoursOverride();
  const saveRange = useSetHoursOverrideRange();
  const clear = useClearHoursOverride();
  const schema = useMemo(() => createSpecialDayFormSchema(t.issues), [t.issues]);
  const form = useForm<SpecialDayFormValues>({ resolver: zodResolver(schema), defaultValues: EMPTY_SPECIAL_DAY });
  const { errors } = form.formState;
  const [date, kind, weekdays] = useWatch({ control: form.control, name: ["date", "kind", "weekdays"] });
  const invalid = (name: keyof SpecialDayFormValues, id: string) => ({ "aria-invalid": Boolean(errors[name]), "aria-describedby": errors[name] ? fieldErrorId(id) : undefined });

  const submit = form.handleSubmit(async (draft) => {
    try {
      if (isRangeDraft(draft)) await saveRange.mutateAsync({ branchId, input: specialDayRangeInput(draft) });
      else await save.mutateAsync({ branchId, date: draft.date, input: specialDayInput(draft) });
      form.reset(EMPTY_SPECIAL_DAY);
    } catch (failure) {
      applyFormError(form, mapApiFormError(failure, t.toast.failed, mapSpecialDayFieldName));
    }
  });

  return (
    <section aria-labelledby="special-days-title" className="flex flex-col gap-4 rounded-xl border border-border p-4">
      <div className="flex flex-col gap-1">
        <h2 id="special-days-title" className="font-heading text-lg font-semibold">{t.title}</h2>
        <p className="text-sm text-muted-foreground">{t.description}</p>
      </div>

      <form onSubmit={submit} noValidate className="flex flex-col gap-3">
        <FormErrorBanner message={errors.root?.message} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <FormField id="special-day-date" label={t.date} error={errors.date?.message}>
            <Input id="special-day-date" type="date" dir="ltr" {...invalid("date", "special-day-date")} {...form.register("date")} />
          </FormField>
          <FormField id="special-day-kind" label={t.kind} error={errors.kind?.message}>
            <NativeSelect id="special-day-kind" {...form.register("kind")}>
              <option value="closed">{t.closedAllDay}</option>
              <option value="hours">{t.specialHours}</option>
            </NativeSelect>
          </FormField>
          <FormField id="special-day-end" label={t.endDate} hint={t.endDateHint} error={errors.endDate?.message}>
            <Input id="special-day-end" type="date" dir="ltr" min={date || undefined} {...invalid("endDate", "special-day-end")} {...form.register("endDate")} />
          </FormField>
          {kind === "hours" ? (
            <>
              <FormField id="special-day-opens" label={dictionary.workingHours.opensAt} error={errors.opens?.message}>
                <Input id="special-day-opens" type="time" dir="ltr" {...invalid("opens", "special-day-opens")} {...form.register("opens")} />
              </FormField>
              <FormField id="special-day-closes" label={dictionary.workingHours.closesAt} error={errors.closes?.message}>
                <Input id="special-day-closes" type="time" dir="ltr" {...invalid("closes", "special-day-closes")} {...form.register("closes")} />
              </FormField>
            </>
          ) : null}
        </div>
        <FormField id="special-day-weekdays" label={t.repeatOn} hint={t.repeatOnHint} error={errors.weekdays?.message}>
          <WeekdayPicker label={t.repeatOn} value={weekdays} onChange={(next) => form.setValue("weekdays", next)} />
        </FormField>
        <div>
          <LoadingButton type="submit" loading={form.formState.isSubmitting || save.isPending || saveRange.isPending} loadingLabel={dictionary.common.loading}>{t.add}</LoadingButton>
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
