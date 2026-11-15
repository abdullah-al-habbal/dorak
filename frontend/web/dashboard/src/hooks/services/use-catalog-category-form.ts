"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";

import { OverlayKind } from "@/enums/overlay-kind.enum";
import { useDeleteCatalogCategory } from "@/hooks/services/use-delete-catalog-category";
import { useDictionary } from "@/hooks/core/use-dictionary";
import { useOverlay } from "@/hooks/core/use-overlay";
import { useSaveCatalogCategory } from "@/hooks/services/use-save-catalog-category";
import { catalogCategoryToForm, emptyCatalogCategoryForm, formToCatalogCategoryPayload } from "@/lib/services/catalog-category-form.util";
import { mapCatalogCategorySaveError } from "@/lib/services/catalog-category-form-error.util";
import { createCatalogCategorySchema } from "@/schemas/services/catalog-category-form.zod";
import type { CatalogCategoryFormValues } from "@/schemas/services/catalog-category-form.zod";
import type { AdminCatalogCategory } from "@/types/services/admin-catalog-category.type";

interface CatalogCategoryFormController {
  form: UseFormReturn<CatalogCategoryFormValues>;
  busy: boolean;
  submit: () => Promise<void>;
  confirmDelete: () => void;
}

/** Wires the category form to save and delete. `category` is the row being edited. */
export function useCatalogCategoryForm(category: AdminCatalogCategory | undefined, onClose: () => void): CatalogCategoryFormController {
  const { adminCatalog: t } = useDictionary();
  const overlay = useOverlay();
  const save = useSaveCatalogCategory();
  const remove = useDeleteCatalogCategory();
  const schema = useMemo(() => createCatalogCategorySchema(t.form.validation), [t.form.validation]);
  const form = useForm<CatalogCategoryFormValues>({ resolver: zodResolver(schema), defaultValues: category ? catalogCategoryToForm(category) : emptyCatalogCategoryForm() });
  const busy = form.formState.isSubmitting || save.isPending;

  const submit = form.handleSubmit(async (values) => {
    try {
      await save.mutateAsync({ id: category?.id, payload: formToCatalogCategoryPayload(values) });
      onClose();
    } catch (error) {
      const mapped = mapCatalogCategorySaveError(error, t.form.errors.generic);
      for (const [name, message] of Object.entries(mapped.fieldErrors)) form.setError(name as keyof CatalogCategoryFormValues, { message });
      if (mapped.formError) form.setError("root", { message: mapped.formError });
    }
  });

  function confirmDelete(): void {
    if (!category) return;
    onClose();
    overlay.open({
      kind: OverlayKind.Confirm,
      title: t.confirm.deleteTitle,
      description: t.confirm.deleteBody,
      confirmLabel: t.confirm.delete,
      destructive: true,
      onConfirm: async () => {
        await remove.mutateAsync(category.id);
      },
    });
  }

  return { form, busy, submit, confirmDelete };
}
