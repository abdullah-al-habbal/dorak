"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";
import { useDictionary } from "@/hooks/use-dictionary";
import { useLookupOptionsQuery } from "@/hooks/use-lookup-options-query";
import { useMonetizationMutation } from "@/hooks/use-monetization-mutation";
import {
  getPlanFeatureKeys,
  savePlan,
} from "@/services/api/dashboard/monetization/monetization.query";
import {
  DEFAULT_INTERVAL_UNIT,
  INTERVAL_UNITS,
  MONETIZATION_QUERY_KEYS,
} from "@/services/api/dashboard/monetization/monetization.constant";
import { fromMinorUnits } from "@/services/api/dashboard/monetization/monetization.util";
import { planFormSchema } from "@/services/api/dashboard/monetization/schemas/monetization.schema";
import type { IPlan } from "@/services/api/dashboard/monetization/types/iplan.types";
import type { IPlanForm } from "@/services/api/dashboard/monetization/types/iplan-form.types";
import type { IPlanFormInput } from "@/services/api/dashboard/monetization/types/iplan-form-input.types";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

interface IPlanFormProps {
  plan?: IPlan;
  onDone: () => void;
}

function defaultsFor(plan?: IPlan): IPlanFormInput {
  return {
    nameEn: plan?.name.en ?? "",
    nameAr: plan?.name.ar ?? "",
    descriptionEn: plan?.description.en ?? "",
    descriptionAr: plan?.description.ar ?? "",
    price: plan ? fromMinorUnits(plan.priceMinor) : 0,
    currencyCode: plan?.currency?.code ?? "",
    intervalUnit: plan?.intervalUnit ?? DEFAULT_INTERVAL_UNIT,
    intervalCount: plan?.intervalCount ?? 1,
    isActive: plan?.isActive ?? true,
    featureKeys: plan?.featureKeys ?? [],
  };
}

export function PlanForm({ plan, onDone }: IPlanFormProps) {
  const copy = useDictionary().monetization;
  const currencies = useLookupOptionsQuery("currencies");
  const featureKeys = useQuery({
    queryKey: MONETIZATION_QUERY_KEYS.featureKeys,
    queryFn: getPlanFeatureKeys,
  });
  const form = useForm<IPlanFormInput, unknown, IPlanForm>({
    resolver: zodResolver(planFormSchema),
    defaultValues: defaultsFor(plan),
  });
  const { errors } = form.formState;
  const save = useMonetizationMutation(
    (value: IPlanForm) => savePlan(value, plan?.id),
    {
      successMessage: copy.saved,
      onSuccess: () => {
        form.reset(defaultsFor());
        onDone();
      },
    },
  );
  const field = (
    name:
      | "nameEn"
      | "nameAr"
      | "descriptionEn"
      | "descriptionAr"
      | "price"
      | "intervalCount",
    label: string,
  ) => (
    <label className="grid gap-1 text-sm text-text-100">
      <span>{label}</span>
      <Input
        state={errors[name] ? "error" : "default"}
        {...form.register(name)}
      />
    </label>
  );

  return (
    <form
      className="grid gap-4 sm:grid-cols-2"
      onSubmit={form.handleSubmit((value) => save.mutate(value))}
    >
      {field("nameEn", copy.nameEn)}
      {field("nameAr", copy.nameAr)}
      {field("descriptionEn", copy.descriptionEn)}
      {field("descriptionAr", copy.descriptionAr)}
      {field("price", copy.plans.price)}
      <label className="grid gap-1 text-sm text-text-100">
        <span>{copy.plans.currency}</span>
        <select
          className="rounded-lg border border-card-border bg-input-background px-4 py-2.5"
          {...form.register("currencyCode")}
        >
          <option value="">{copy.plans.selectCurrency}</option>
          {currencies.data?.map((currency) => (
            <option key={currency.id} value={currency.id}>
              {currency.label}
            </option>
          ))}
        </select>
      </label>
      {field("intervalCount", copy.plans.intervalCount)}
      <label className="grid gap-1 text-sm text-text-100">
        <span>{copy.plans.intervalUnit}</span>
        <select
          className="rounded-lg border border-card-border bg-input-background px-4 py-2.5"
          {...form.register("intervalUnit")}
        >
          {INTERVAL_UNITS.map((unit) => (
            <option key={unit} value={unit}>
              {copy.plans.units[unit]}
            </option>
          ))}
        </select>
      </label>
      <fieldset className="grid gap-2 text-sm text-text-100 sm:col-span-2">
        <legend>{copy.plans.features}</legend>
        <div className="flex flex-wrap gap-3">
          {featureKeys.data?.map((key) => (
            <label key={key} className="flex items-center gap-1">
              <input
                type="checkbox"
                value={key}
                {...form.register("featureKeys")}
              />
              {key}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="flex items-center gap-2 text-sm text-text-100">
        <input type="checkbox" {...form.register("isActive")} />
        {copy.active}
      </label>
      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" isDisabled={save.isPending}>
          {copy.save}
        </Button>
        {plan ? (
          <Button type="button" appearance="outline" onPress={onDone}>
            {copy.cancelEdit}
          </Button>
        ) : null}
      </div>
    </form>
  );
}
