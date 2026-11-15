"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";

import { useDictionary } from "@/hooks/core/use-dictionary";
import { useSaveBrand } from "@/hooks/brands/use-save-brand";
import { brandToEditForm, editFormToBrandPayload, mapBrandEditError } from "@/lib/brand-edit-form.util";
import { createBrandEditSchema } from "@/schemas/brand-edit-form.zod";
import type { BrandEditFormValues } from "@/schemas/brand-edit-form.zod";
import type { AdminBrand } from "@/types/brands/admin-brand.type";

interface BrandEditFormController {
  form: UseFormReturn<BrandEditFormValues>;
  busy: boolean;
  submit: () => Promise<void>;
}

export function useBrandEditForm(brand: AdminBrand, onClose: () => void): BrandEditFormController {
  const { adminBrands: t } = useDictionary();
  const save = useSaveBrand();
  const schema = useMemo(() => createBrandEditSchema(t.edit.validation), [t.edit.validation]);
  const form = useForm<BrandEditFormValues>({ resolver: zodResolver(schema), defaultValues: brandToEditForm(brand) });
  const busy = form.formState.isSubmitting || save.isPending;

  const submit = form.handleSubmit(async (values) => {
    try {
      await save.mutateAsync({ id: brand.id, payload: editFormToBrandPayload(values) });
      onClose();
    } catch (error) {
      const mapped = mapBrandEditError(error, t.edit.generic);
      for (const [name, message] of Object.entries(mapped.fieldErrors)) form.setError(name as keyof BrandEditFormValues, { message });
      if (mapped.formError) form.setError("root", { message: mapped.formError });
    }
  });

  return { form, busy, submit };
}
