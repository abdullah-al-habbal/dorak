"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";

import { useBrandLogo } from "@/hooks/brands/owner/use-brand-logo";
import { useCreateBrand } from "@/hooks/brands/owner/use-create-brand";
import { useDictionary } from "@/hooks/core/state/use-dictionary";
import { createFormToBrandPayload, EMPTY_BRAND_CREATE_FORM, mapBrandCreateError } from "@/lib/brands/brand-create-form.util";
import { createBrandCreateSchema } from "@/schemas/brands/brand-create-form.zod";
import type { BrandCreateFormValues } from "@/schemas/brands/brand-create-form.zod";

interface BrandCreateFormController {
  form: UseFormReturn<BrandCreateFormValues>;
  busy: boolean;
  logo: ReturnType<typeof useBrandLogo>;
  submit: () => Promise<void>;
}

export function useBrandCreateForm(onClose: () => void): BrandCreateFormController {
  const { ownerBrand: t } = useDictionary();
  const create = useCreateBrand();
  const logo = useBrandLogo();
  const schema = useMemo(() => createBrandCreateSchema(t.create.validation), [t.create.validation]);
  const form = useForm<BrandCreateFormValues>({ resolver: zodResolver(schema), defaultValues: EMPTY_BRAND_CREATE_FORM });
  const busy = form.formState.isSubmitting || create.isPending;

  const submit = form.handleSubmit(async (values) => {
    try {
      const logoUrl = await logo.upload();
      await create.mutateAsync(createFormToBrandPayload(values, logoUrl));
      onClose();
    } catch (error) {
      const mapped = mapBrandCreateError(error, t.create.generic);
      for (const [name, message] of Object.entries(mapped.fieldErrors)) form.setError(name as keyof BrandCreateFormValues, { message });
      if (mapped.formError) form.setError("root", { message: mapped.formError });
    }
  });

  return { form, busy, logo, submit };
}
