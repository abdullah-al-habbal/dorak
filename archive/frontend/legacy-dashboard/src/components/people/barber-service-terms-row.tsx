"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";
import { useBarberServiceOverrideMutation } from "@/hooks/use-barber-service-override-mutation";
import { useDictionary } from "@/hooks/use-dictionary";
import { useI18n } from "@/hooks/use-i18n";
import {
  clearBarberServiceOverride,
  saveBarberServiceOverride,
} from "@/services/api/dashboard/barber-service-override/barber-service-override.mutation";
import { barberServiceOverrideFormSchema } from "@/services/api/dashboard/barber-service-override/schemas/barber-service-override-form.schema";
import {
  formatMinorUnits,
  fromMinorUnits,
} from "@/services/api/dashboard/monetization/monetization.util";
import type { IBarberServiceOverrideForm } from "@/services/api/dashboard/barber-service-override/types/ibarber-service-override-form.types";
import type { IBarberServiceOverrideFormInput } from "@/services/api/dashboard/barber-service-override/types/ibarber-service-override-form.types";
import type { IBarberServiceTerms } from "@/services/api/dashboard/barber-service-override/types/ibarber-service-terms.types";
import { useForm } from "react-hook-form";

interface IBarberServiceTermsRowProps {
  barberId: string;
  brandId: string;
  terms: IBarberServiceTerms;
}

function defaultsFor(
  terms: IBarberServiceTerms,
): IBarberServiceOverrideFormInput {
  return terms.isOverridden
    ? {
        price: fromMinorUnits(terms.priceAmountMinor),
        durationMinutes: terms.durationMinutes,
      }
    : { price: "", durationMinutes: "" };
}

export function BarberServiceTermsRow({
  barberId,
  brandId,
  terms,
}: IBarberServiceTermsRowProps) {
  const copy = useDictionary().barberServiceTerms;
  const { locale } = useI18n();
  const form = useForm<
    IBarberServiceOverrideFormInput,
    unknown,
    IBarberServiceOverrideForm
  >({
    resolver: zodResolver(barberServiceOverrideFormSchema),
    defaultValues: defaultsFor(terms),
  });
  const { errors } = form.formState;
  const save = useBarberServiceOverrideMutation(
    (value: IBarberServiceOverrideForm) =>
      saveBarberServiceOverride(barberId, terms.id, brandId, value),
    copy.saved,
  );
  const reset = useBarberServiceOverrideMutation(
    () => clearBarberServiceOverride(barberId, terms.id, brandId),
    copy.cleared,
  );
  const busy = save.isPending || reset.isPending;

  return (
    <li className="space-y-3 rounded-xl border border-border-primary bg-card-primary p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-medium text-title-50">{terms.name[locale]}</p>
        {terms.isOverridden ? (
          <span className="rounded-full bg-card-secondary px-2 py-0.5 text-xs text-text-100">
            {copy.overridden}
          </span>
        ) : null}
      </div>
      <p className="text-xs text-text-secondary">
        {copy.default}:{" "}
        {formatMinorUnits(terms.defaultPriceAmountMinor, terms.currencyCode)}
        {terms.defaultDurationMinutes === null
          ? ""
          : ` · ${terms.defaultDurationMinutes}`}
      </p>
      <form
        className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
        onSubmit={form.handleSubmit((value) => save.mutate(value))}
      >
        <label className="grid gap-1 text-sm text-text-100">
          <span>{copy.price}</span>
          <Input
            inputMode="decimal"
            state={errors.price ? "error" : "default"}
            {...form.register("price")}
          />
          {errors.price ? (
            <span
              className="text-xs text-input-error-focus-border"
              role="alert"
            >
              {copy.needsValue}
            </span>
          ) : null}
        </label>
        <label className="grid gap-1 text-sm text-text-100">
          <span>{copy.duration}</span>
          <Input
            inputMode="numeric"
            state={errors.durationMinutes ? "error" : "default"}
            {...form.register("durationMinutes")}
          />
        </label>
        <div className="flex items-end gap-2">
          <Button type="submit" isDisabled={busy}>
            {copy.save}
          </Button>
          {terms.isOverridden ? (
            <Button
              type="button"
              appearance="outline"
              isDisabled={busy}
              onPress={() => reset.mutate(undefined)}
            >
              {copy.reset}
            </Button>
          ) : null}
        </div>
      </form>
    </li>
  );
}
