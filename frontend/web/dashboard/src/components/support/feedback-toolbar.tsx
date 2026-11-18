"use client";

import type { JSX } from "react";

import { SearchInput } from "@/components/common/search-input";
import { NativeSelect } from "@/components/ui/native-select";
import { FEEDBACK_FILTER_ALL } from "@/config/support/feedback.constant";
import { FeedbackApp } from "@/enums/support/feedback-app.enum";
import { FeedbackKind } from "@/enums/support/feedback-kind.enum";
import { FeedbackPlatform } from "@/enums/support/feedback-platform.enum";
import { FeedbackStatus } from "@/enums/support/feedback-status.enum";
import { useDictionary } from "@/hooks/core/state/use-dictionary";
import { feedbackFiltersFromParams } from "@/lib/support/feedback-filters.util";
import type { FeedbackFilters } from "@/types/support/feedback-filters.type";

interface FeedbackToolbarProps {
  filters: FeedbackFilters;
  onChange: (patch: Partial<FeedbackFilters>) => void;
}

type SelectKey = "kind" | "status" | "app" | "platform";

/** Reuses the URL parser so a select can only ever hold a known value or `all`. */
function parse(key: SelectKey, value: string): Partial<FeedbackFilters> {
  return { [key]: feedbackFiltersFromParams(new URLSearchParams({ [key]: value }))[key], page: 1 };
}

export function FeedbackToolbar({ filters, onChange }: FeedbackToolbarProps): JSX.Element {
  const { support: t } = useDictionary();
  const selects: { key: SelectKey; label: string; all: string; options: { value: string; label: string }[] }[] = [
    { key: "kind", label: t.filters.kind, all: t.filters.allKinds, options: Object.values(FeedbackKind).map((value) => ({ value, label: t.kind[value] })) },
    { key: "status", label: t.filters.status, all: t.filters.allStatuses, options: Object.values(FeedbackStatus).map((value) => ({ value, label: t.status[value] })) },
    { key: "app", label: t.filters.app, all: t.filters.allApps, options: Object.values(FeedbackApp).map((value) => ({ value, label: t.app[value] })) },
    { key: "platform", label: t.filters.platform, all: t.filters.allPlatforms, options: Object.values(FeedbackPlatform).map((value) => ({ value, label: t.platform[value] })) },
  ];
  return (
    <div role="group" aria-label={t.filters.toolbar} className="flex flex-wrap items-center gap-2">
      <SearchInput value={filters.search} label={t.filters.search} onCommit={(search) => onChange({ search, page: 1 })} />
      {selects.map(({ key, label, all, options }) => (
        <label key={key} className="w-full sm:w-44">
          <span className="sr-only">{label}</span>
          <NativeSelect value={filters[key]} onChange={(event) => onChange(parse(key, event.target.value))}>
            <option value={FEEDBACK_FILTER_ALL}>{all}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </NativeSelect>
        </label>
      ))}
    </div>
  );
}
