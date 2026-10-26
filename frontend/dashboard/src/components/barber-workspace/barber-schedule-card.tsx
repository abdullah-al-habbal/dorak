"use client";

import { Button } from "@/components/tailgrids/core/button";
import { Checkbox } from "@/components/tailgrids/core/checkbox";
import { Input } from "@/components/tailgrids/core/input";
import type { UpdateScheduleFormInput } from "@/services/api/barber-workspace/types/barber-workspace.types";
import type { UseFormReturn } from "react-hook-form";

interface IBarberScheduleCardProps {
  title: string;
  noScheduleLabel: string;
  activeLabel: string;
  startTimeLabel: string;
  endTimeLabel: string;
  saveLabel: string;
  weekdayLabels: readonly string[];
  form: UseFormReturn<UpdateScheduleFormInput>;
  onSubmit: (value: UpdateScheduleFormInput) => void;
  isPending: boolean;
  isLoading: boolean;
}

export function BarberScheduleCard({
  title,
  noScheduleLabel,
  activeLabel,
  startTimeLabel,
  endTimeLabel,
  saveLabel,
  weekdayLabels,
  form,
  onSubmit,
  isPending,
  isLoading,
}: IBarberScheduleCardProps) {
  const entries = form.watch("schedule");

  return (
    <section className="rounded-xl border border-border-primary bg-card-primary p-5 lg:col-span-3">
      <h2 className="font-semibold text-title-50">{title}</h2>
      {isLoading ? null : entries.length === 0 ? (
        <p className="mt-2 text-sm text-text-secondary">{noScheduleLabel}</p>
      ) : (
        <form className="mt-3 space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
          {entries.map((entry, index) => (
            <div
              className="flex flex-wrap items-center gap-3"
              key={entry.dayOfWeek}
            >
              <Checkbox
                aria-label={activeLabel}
                isSelected={entry.isActive}
                onChange={(isSelected) =>
                  form.setValue(`schedule.${index}.isActive`, isSelected)
                }
              >
                <span className="w-24 text-sm text-text-100">
                  {weekdayLabels[entry.dayOfWeek]}
                </span>
              </Checkbox>
              <label className="flex items-center gap-2 text-sm text-text-secondary">
                {startTimeLabel}
                <Input
                  type="time"
                  disabled={!entry.isActive}
                  {...form.register(`schedule.${index}.startTime`)}
                />
              </label>
              <label className="flex items-center gap-2 text-sm text-text-secondary">
                {endTimeLabel}
                <Input
                  type="time"
                  disabled={!entry.isActive}
                  {...form.register(`schedule.${index}.endTime`)}
                />
              </label>
            </div>
          ))}
          <Button type="submit" size="sm" isDisabled={isPending}>
            {saveLabel}
          </Button>
        </form>
      )}
    </section>
  );
}
