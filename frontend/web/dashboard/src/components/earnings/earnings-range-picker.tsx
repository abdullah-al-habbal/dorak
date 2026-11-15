"use client";

import { useState } from "react";
import type { JSX } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EARNINGS_PRESETS } from "@/config/earnings.constant";
import { EarningsPreset } from "@/enums/earnings-preset.enum";
import { useDictionary } from "@/hooks/core/use-dictionary";
import { detectPreset, EarningsRangeIssue, presetRange, rangeIssue } from "@/lib/earnings/earnings-range.util";
import type { EarningsRange } from "@/types/earnings/earnings-range.type";

interface EarningsRangePickerProps {
  range: EarningsRange;
  today: Date;
  onChange: (range: EarningsRange) => void;
}

/** Preset chips for the common periods and two native date fields for anything else. */
export function EarningsRangePicker({ range, today, onChange }: EarningsRangePickerProps): JSX.Element {
  const { earnings: t } = useDictionary();
  const active = detectPreset(range, today);

  return (
    <div role="group" aria-label={t.range.label} className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
      <div className="flex flex-wrap gap-2">
        {EARNINGS_PRESETS.map((preset) => (
          <Button
            key={preset}
            type="button"
            size="sm"
            variant={active === preset ? "default" : "outline"}
            aria-pressed={active === preset}
            onClick={() => onChange(presetRange(preset, today))}
          >
            {t.range.presets[preset]}
          </Button>
        ))}
      </div>
      <DateFields key={`${range.from}_${range.to}`} range={range} custom={active === EarningsPreset.Custom} onChange={onChange} />
    </div>
  );
}

function DateFields({ range, custom, onChange }: { range: EarningsRange; custom: boolean; onChange: (range: EarningsRange) => void }): JSX.Element {
  const { earnings: t } = useDictionary();
  const [draft, setDraft] = useState(range);
  const issue = rangeIssue(draft);

  const update = (patch: Partial<EarningsRange>): void => {
    const next = { ...draft, ...patch };
    setDraft(next);
    if (rangeIssue(next) === null) onChange(next);
  };

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="earnings-from">{t.range.from}</Label>
        <Input id="earnings-from" type="date" value={draft.from} aria-invalid={issue !== null} aria-describedby={issue ? "earnings-range-issue" : undefined} onChange={(event) => update({ from: event.target.value })} className="w-40" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="earnings-to">{t.range.to}</Label>
        <Input id="earnings-to" type="date" value={draft.to} aria-invalid={issue !== null} aria-describedby={issue ? "earnings-range-issue" : undefined} onChange={(event) => update({ to: event.target.value })} className="w-40" />
      </div>
      {custom ? <span className="pb-2 text-sm text-muted-foreground">{t.range.presets.custom}</span> : null}
      {issue ? <p id="earnings-range-issue" role="alert" className="basis-full text-sm text-destructive">{issueCopy(t.range.issues, issue)}</p> : null}
    </div>
  );
}

function issueCopy(issues: { inverted: string; tooLong: string; invalid: string }, issue: EarningsRangeIssue): string {
  if (issue === EarningsRangeIssue.Inverted) return issues.inverted;
  return issue === EarningsRangeIssue.TooLong ? issues.tooLong : issues.invalid;
}
