"use client";

import type { JSX } from "react";
import { useController } from "react-hook-form";
import type { Control } from "react-hook-form";

import { fieldErrorId } from "@/components/common/form-field";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/hooks/core/use-i18n";
import { localizedText } from "@/lib/booking-format.util";
import type { WalkInFormValues } from "@/schemas/walk-in-form.zod";
import type { ServiceOption } from "@/types/services/service-option.type";

interface WalkInServicePickerProps {
  control: Control<WalkInFormValues>;
  services: readonly ServiceOption[] | undefined;
  loading: boolean;
  error?: string;
}

const FIELD_ID = "walk-in-services";

export function WalkInServicePicker({ control, services, loading, error }: WalkInServicePickerProps): JSX.Element {
  const { locale, dictionary } = useI18n();
  const w = dictionary.bookings.walkIn;
  const { field } = useController({ control, name: "service_ids" });

  function toggle(id: string, checked: boolean): void {
    field.onChange(checked ? [...field.value, id] : field.value.filter((value) => value !== id));
  }

  return (
    <fieldset className="flex flex-col gap-1.5" aria-describedby={error ? fieldErrorId(FIELD_ID) : undefined}>
      <legend className="mb-1.5 text-sm font-medium">{w.services}</legend>
      {loading ? <Skeleton className="h-20 w-full motion-reduce:animate-none" /> : null}
      {services?.length === 0 ? <p className="text-sm text-muted-foreground">{w.servicesEmpty}</p> : null}
      {services && services.length > 0 ? (
        <ul className="flex max-h-40 flex-col overflow-y-auto rounded-lg border border-input bg-card">
          {services.map((service) => (
            <li key={service.id}>
              <label className="flex min-h-11 cursor-pointer items-center gap-3 px-3 text-sm hover:bg-muted/50">
                <input
                  type="checkbox"
                  className="size-4 accent-primary"
                  checked={field.value.includes(service.id)}
                  onChange={(event) => toggle(service.id, event.target.checked)}
                  onBlur={field.onBlur}
                />
                <span className="flex-1">{localizedText(service.name, locale)}</span>
                {service.duration_minutes ? <span className="tabular text-xs text-muted-foreground">{w.minutes.replace("{count}", String(service.duration_minutes))}</span> : null}
              </label>
            </li>
          ))}
        </ul>
      ) : null}
      {error ? <p id={fieldErrorId(FIELD_ID)} role="alert" className="text-sm text-destructive">{error}</p> : null}
    </fieldset>
  );
}
