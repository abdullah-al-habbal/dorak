"use client";

import { Checkbox } from "@/components/tailgrids/core/checkbox";
import { Input } from "@/components/tailgrids/core/input";
import type { IBranchOpeningHoursEditorProps } from "@/components/entities/branch-opening-hours-editor.types";
import { useDictionary } from "@/hooks/use-dictionary";
import { BRANCH_WEEKDAYS } from "@/services/api/dashboard/branch/branch-opening-hours.constant";
import { Controller } from "react-hook-form";

export function BranchOpeningHoursEditor({
  form,
}: IBranchOpeningHoursEditorProps) {
  const fieldCopy = useDictionary().operations.field;
  const errors = form.formState.errors.openingHours as
    | Record<number, { closesTime?: unknown } | undefined>
    | undefined;

  return (
    <fieldset className="grid gap-3 sm:col-span-2">
      <legend className="text-sm font-medium text-text-100">
        {fieldCopy.openingHours}
      </legend>
      <p className="text-sm text-text-secondary">
        {fieldCopy.openingHoursHint}
      </p>
      {BRANCH_WEEKDAYS.map((dayOfWeek) => {
        const closed =
          form.watch(`openingHours.${dayOfWeek}.isClosed`) === true;
        return (
          <div
            className="grid grid-cols-[8rem_1fr_1fr_auto] items-center gap-3 text-sm text-text-100"
            data-testid={`opening-day-${dayOfWeek}`}
            key={dayOfWeek}
          >
            <span>{fieldCopy.weekdays[dayOfWeek]}</span>
            <Input
              aria-label={`${fieldCopy.weekdays[dayOfWeek]} ${fieldCopy.opensTime}`}
              disabled={closed}
              type="time"
              {...form.register(`openingHours.${dayOfWeek}.opensTime`, {
                setValueAs: (value) => (value === "" ? null : value),
              })}
            />
            <Input
              aria-label={`${fieldCopy.weekdays[dayOfWeek]} ${fieldCopy.closesTime}`}
              disabled={closed}
              state={errors?.[dayOfWeek]?.closesTime ? "error" : "default"}
              type="time"
              {...form.register(`openingHours.${dayOfWeek}.closesTime`, {
                setValueAs: (value) => (value === "" ? null : value),
              })}
            />
            <Controller
              control={form.control}
              name={`openingHours.${dayOfWeek}.isClosed`}
              render={({ field }) => (
                <Checkbox
                  isSelected={field.value === true}
                  onChange={field.onChange}
                >
                  {fieldCopy.closed}
                </Checkbox>
              )}
            />
          </div>
        );
      })}
    </fieldset>
  );
}
