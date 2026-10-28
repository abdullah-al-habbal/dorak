"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";
import { useDictionary } from "@/hooks/use-dictionary";
import { useLookupOptionsQuery } from "@/hooks/use-lookup-options-query";
import { useMonetizationMutation } from "@/hooks/use-monetization-mutation";
import {
  COMMISSION_SCOPES,
  COMMISSION_TYPES,
} from "@/services/api/dashboard/monetization/monetization.constant";
import { saveCommissionRule } from "@/services/api/dashboard/monetization/monetization.query";
import {
  basisPointsToPercent,
  fromMinorUnits,
} from "@/services/api/dashboard/monetization/monetization.util";
import { commissionRuleFormSchema } from "@/services/api/dashboard/monetization/schemas/monetization.schema";
import type {
  ICommissionRule,
  ICommissionRuleForm,
  ICommissionRuleFormInput,
} from "@/services/api/dashboard/monetization/types/imonetization.types";
import { useForm } from "react-hook-form";

interface ICommissionRuleFormProps {
  rule?: ICommissionRule;
  onDone: () => void;
}

function defaultsFor(rule?: ICommissionRule): ICommissionRuleFormInput {
  return {
    scope: rule?.scope ?? "global",
    scopeId: rule?.scopeId ?? "",
    type: rule?.type ?? "percent",
    value: rule
      ? rule.type === "percent"
        ? basisPointsToPercent(rule.value)
        : fromMinorUnits(rule.value)
      : 10,
    currencyId: rule?.currency?.id ?? "",
    isActive: rule?.isActive ?? true,
  };
}

export function CommissionRuleForm({ rule, onDone }: ICommissionRuleFormProps) {
  const copy = useDictionary().monetization;
  const currencies = useLookupOptionsQuery("currencies");
  const form = useForm<ICommissionRuleFormInput, unknown, ICommissionRuleForm>({
    resolver: zodResolver(commissionRuleFormSchema),
    defaultValues: defaultsFor(rule),
  });
  const { errors } = form.formState;
  const save = useMonetizationMutation(
    (value: ICommissionRuleForm) => saveCommissionRule(value, rule?.id),
    {
      successMessage: copy.saved,
      onSuccess: () => {
        form.reset(defaultsFor());
        onDone();
      },
    },
  );
  const selectClass =
    "rounded-lg border border-card-border bg-input-background px-4 py-2.5";

  return (
    <form
      className="grid gap-4 sm:grid-cols-2"
      onSubmit={form.handleSubmit((value) => save.mutate(value))}
    >
      <label className="grid gap-1 text-sm text-text-100">
        <span>{copy.rules.scope}</span>
        <select className={selectClass} {...form.register("scope")}>
          {COMMISSION_SCOPES.map((scope) => (
            <option key={scope} value={scope}>
              {copy.rules.scopes[scope]}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm text-text-100">
        <span>{copy.rules.scopeId}</span>
        <Input
          state={errors.scopeId ? "error" : "default"}
          {...form.register("scopeId")}
        />
      </label>
      <label className="grid gap-1 text-sm text-text-100">
        <span>{copy.rules.type}</span>
        <select className={selectClass} {...form.register("type")}>
          {COMMISSION_TYPES.map((type) => (
            <option key={type} value={type}>
              {copy.rules.types[type]}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm text-text-100">
        <span>{copy.rules.value}</span>
        <Input
          state={errors.value ? "error" : "default"}
          {...form.register("value")}
        />
      </label>
      <label className="grid gap-1 text-sm text-text-100">
        <span>{copy.rules.currency}</span>
        <select className={selectClass} {...form.register("currencyId")}>
          <option value="">{copy.rules.selectCurrency}</option>
          {currencies.data?.map((currency) => (
            <option key={currency.id} value={currency.id}>
              {currency.label}
            </option>
          ))}
        </select>
        {errors.currencyId ? (
          <span className="text-input-error-focus-border" role="alert">
            {copy.rules.selectCurrency}
          </span>
        ) : null}
      </label>
      <label className="flex items-center gap-2 text-sm text-text-100">
        <input type="checkbox" {...form.register("isActive")} />
        {copy.active}
      </label>
      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" isDisabled={save.isPending}>
          {copy.save}
        </Button>
        {rule ? (
          <Button type="button" appearance="outline" onPress={onDone}>
            {copy.cancelEdit}
          </Button>
        ) : null}
      </div>
    </form>
  );
}
