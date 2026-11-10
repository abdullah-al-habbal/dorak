"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";

import { useCreateBrand } from "@/hooks/use-create-brand";
import { useDictionary } from "@/hooks/use-dictionary";
import { createFormToBrandPayload, EMPTY_BRAND_CREATE_FORM, mapBrandCreateError } from "@/lib/brand-create-form.util";
import { createBrandCreateSchema } from "@/schemas/brand-create-form.zod";
import type { BrandCreateFormValues } from "@/schemas/brand-create-form.zod";

interface BrandCreateFormController {
  form: UseFormReturn<BrandCreateFormValues>;
  busy: boolean;
  submit: () => Promise<void>;
}

export function useBrandCreateForm(onClose: () => void): BrandCreateFormController {
  const { ownerBrand: t } = useDictionary();
  const create = useCreateBrand();
  const schema = useMemo(() => createBrandCreateSchema(t.create.validation), [t.create.validation]);
  const form = useForm<BrandCreateFormValues>({ resolver: zodResolver(schema), defaultValues: EMPTY_BRAND_CREATE_FORM });
  const busy = form.formState.isSubmitting || create.isPending;

  const submit = form.handleSubmit(async (values) => {
    try {
      await create.mutateAsync(createFormToBrandPayload(values));
      onClose();
    } catch (error) {
      const mapped = mapBrandCreateError(error, t.create.generic);
      for (const [name, message] of Object.entries(mapped.fieldErrors)) form.setError(name as keyof BrandCreateFormValues, { message });
      if (mapped.formError) form.setError("root", { message: mapped.formError });
    }
  });

  return { form, busy, submit };
}
