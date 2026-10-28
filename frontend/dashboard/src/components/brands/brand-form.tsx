"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";
import { TextArea } from "@/components/tailgrids/core/text-area";
import { useDictionary } from "@/hooks/use-dictionary";
import { useLookupOptionsQuery } from "@/hooks/use-lookup-options-query";
import { ApiClientError } from "@/services/api/core/client-error";
import {
  notifyApiError,
  notifySuccess,
} from "@/services/api/core/notifications";
import {
  BRAND_QUERY_KEYS,
  BRAND_UNIVERSES,
} from "@/services/api/dashboard/brands/brands.constant";
import {
  createBrand,
  updateBrand,
} from "@/services/api/dashboard/brands/brands.query";
import { brandFormSchema } from "@/services/api/dashboard/brands/schemas/brands.schema";
import type { IBrand } from "@/services/api/dashboard/brands/types/ibrand.types";
import type { IBrandForm } from "@/services/api/dashboard/brands/types/ibrand-form.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { BRAND_SERVER_FIELD_MAP } from "@/services/api/dashboard/brands/brands.constant";

interface IBrandFormProps {
  /** When set, the form edits this brand instead of creating one. */
  brand?: IBrand;
  onDone: () => void;
}

function defaultsFor(brand?: IBrand): IBrandForm {
  return {
    nameEn: brand?.name.en ?? "",
    nameAr: brand?.name.ar ?? "",
    descriptionEn: brand?.description.en ?? "",
    descriptionAr: brand?.description.ar ?? "",
    logo: brand?.logo ?? "",
    baseCurrencyId: brand?.baseCurrencyId ?? "",
    universe: brand?.universe ?? "unisex",
  };
}

export function BrandForm({ brand, onDone }: IBrandFormProps) {
  const dictionary = useDictionary();
  const copy = dictionary.brands;
  const queryClient = useQueryClient();
  const currencies = useLookupOptionsQuery("currencies");
  const form = useForm<IBrandForm>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: defaultsFor(brand),
  });
  const { errors } = form.formState;

  const save = useMutation({
    mutationFn: (value: IBrandForm) =>
      brand ? updateBrand(brand.id, value) : createBrand(value),
    onSuccess: async () => {
      notifySuccess(brand ? copy.saved : copy.created);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: BRAND_QUERY_KEYS.list }),
        queryClient.invalidateQueries({ queryKey: BRAND_QUERY_KEYS.lookups }),
      ]);
      form.reset(defaultsFor());
      onDone();
    },
    onError: (error) => {
      if (error instanceof ApiClientError && error.status === 422) {
        Object.entries(error.errors ?? {}).forEach(([key, messages]) => {
          const field = BRAND_SERVER_FIELD_MAP[key];
          if (field)
            form.setError(field, { type: "server", message: messages[0] });
        });
        return;
      }
      notifyApiError(error, dictionary);
    },
  });

  const serverError = (name: keyof IBrandForm) =>
    errors[name]?.type === "server" ? (
      <span className="text-input-error-focus-border" role="alert">
        {errors[name]?.message}
      </span>
    ) : null;
  const text = (name: "nameEn" | "nameAr" | "logo", label: string) => (
    <label className="grid gap-1 text-sm text-text-100">
      <span>{label}</span>
      <Input
        state={errors[name] ? "error" : "default"}
        {...form.register(name)}
      />
      {serverError(name)}
    </label>
  );
  const area = (name: "descriptionEn" | "descriptionAr", label: string) => (
    <label className="grid gap-1 text-sm text-text-100">
      <span>{label}</span>
      <TextArea {...form.register(name)} />
      {serverError(name)}
    </label>
  );

  return (
    <form
      className="grid gap-4 sm:grid-cols-2"
      onSubmit={form.handleSubmit((value) => save.mutate(value))}
    >
      {text("nameEn", copy.nameEn)}
      {text("nameAr", copy.nameAr)}
      {area("descriptionEn", copy.descriptionEn)}
      {area("descriptionAr", copy.descriptionAr)}
      {text("logo", copy.logo)}
      <label className="grid gap-1 text-sm text-text-100">
        <span>{copy.baseCurrency}</span>
        <select
          className="rounded-lg border border-card-border bg-input-background px-4 py-2.5"
          {...form.register("baseCurrencyId")}
        >
          <option value="">{copy.selectCurrency}</option>
          {currencies.data?.map((currency) => (
            <option key={currency.id} value={currency.id}>
              {currency.label}
            </option>
          ))}
        </select>
        {serverError("baseCurrencyId")}
      </label>
      <label className="grid gap-1 text-sm text-text-100">
        <span>{copy.universe}</span>
        <select
          className="rounded-lg border border-card-border bg-input-background px-4 py-2.5"
          {...form.register("universe")}
        >
          {BRAND_UNIVERSES.map((value) => (
            <option key={value} value={value}>
              {copy.universes[value]}
            </option>
          ))}
        </select>
      </label>
      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" isDisabled={save.isPending}>
          {copy.save}
        </Button>
        {brand ? (
          <Button type="button" appearance="outline" onPress={onDone}>
            {copy.cancelEdit}
          </Button>
        ) : null}
      </div>
    </form>
  );
}
