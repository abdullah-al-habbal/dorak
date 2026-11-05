"use client";

import { useCallback, useMemo, useState } from "react";
import type { JSX } from "react";

import { FormErrorBanner } from "@/components/common/form-error-banner";
import { WorkingHoursDayRow } from "@/components/working-hours/working-hours-day";
import { WorkingHoursSaveBar } from "@/components/working-hours/working-hours-save-bar";
import { WEEK_START } from "@/config/week-start.constant";
import type { Weekday } from "@/enums/weekday.enum";
import { useI18n } from "@/hooks/use-i18n";
import { useLeaveWarning } from "@/hooks/use-leave-warning";
import { useSaveOpeningHours } from "@/hooks/use-save-opening-hours";
import type { OpeningHoursDay } from "@/interfaces/opening-hours-day.interface";
import type { Shift } from "@/interfaces/shift.interface";
import { mapApiFieldErrors } from "@/lib/api-field-errors.util";
import { addShift, copyDay, findIssues, isSameWeek, orderedDays, removeShift, setDayOpen, updateShift, weekFromServer, weekToPayload } from "@/lib/opening-hours.util";
import type { OpeningHoursWeek } from "@/types/opening-hours-week.type";

interface WorkingHoursEditorProps {
  branchId: string;
  /** The stored schedule. The editor is remounted per branch, so this seeds the draft once. */
  initial: readonly OpeningHoursDay[];
}

export function WorkingHoursEditor({ branchId, initial }: WorkingHoursEditorProps): JSX.Element {
  const { locale, dictionary } = useI18n();
  const t = dictionary.workingHours;
  const save = useSaveOpeningHours(branchId);
  const [baseline, setBaseline] = useState<OpeningHoursWeek>(() => weekFromServer(initial));
  const [draft, setDraft] = useState<OpeningHoursWeek>(baseline);
  const [formError, setFormError] = useState<string | undefined>(undefined);

  const issues = useMemo(() => findIssues(draft), [draft]);
  const dirty = !isSameWeek(draft, baseline);
  useLeaveWarning(dirty);
  const days = useMemo(() => orderedDays(draft, WEEK_START[locale]), [draft, locale]);
  const order = useMemo(() => days.map((day) => day.day_of_week), [days]);

  const toggle = useCallback((day: Weekday, open: boolean) => setDraft((week) => setDayOpen(week, day, open)), []);
  const add = useCallback((day: Weekday) => setDraft((week) => addShift(week, day)), []);
  const remove = useCallback((day: Weekday, index: number) => setDraft((week) => removeShift(week, day, index)), []);
  const update = useCallback((day: Weekday, index: number, patch: Partial<Shift>) => setDraft((week) => updateShift(week, day, index, patch)), []);
  const copy = useCallback((from: Weekday, targets: readonly Weekday[]) => setDraft((week) => copyDay(week, from, targets)), []);
  const discard = useCallback(() => {
    setDraft(baseline);
    setFormError(undefined);
  }, [baseline]);

  const submit = useCallback(async () => {
    setFormError(undefined);
    try {
      const saved = await save.mutateAsync(weekToPayload(draft));
      const next = weekFromServer(saved);
      setBaseline(next);
      setDraft(next);
    } catch (error) {
      const mapped = mapApiFieldErrors(error, t.errors.generic);
      setFormError(Object.values(mapped.fieldErrors)[0] ?? mapped.formError);
    }
  }, [draft, save, t.errors.generic]);

  return (
    <div className="flex flex-col gap-4">
      <FormErrorBanner message={formError} />
      <ul className="flex flex-col divide-y divide-border">
        {days.map((day) => (
          <WorkingHoursDayRow
            key={day.day_of_week}
            day={day}
            issues={issues.filter((entry) => entry.day === day.day_of_week)}
            order={order}
            onToggle={toggle}
            onAddShift={add}
            onRemoveShift={remove}
            onUpdateShift={update}
            onCopy={copy}
          />
        ))}
      </ul>
      <WorkingHoursSaveBar dirty={dirty} blocked={issues.length > 0} saving={save.isPending} onSave={submit} onDiscard={discard} />
    </div>
  );
}
