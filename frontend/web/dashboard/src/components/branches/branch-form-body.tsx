"use client";

import type { JSX } from "react";

import { BranchIdentityFields } from "@/components/branches/branch-identity-fields";
import { BranchStorefrontFields } from "@/components/branches/branch-storefront-fields";
import { LoadingButton } from "@/components/buttons/loading-button";
import { FormErrorBanner } from "@/components/common/form-error-banner";
import { FormField } from "@/components/common/form-field";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { NativeSelect } from "@/components/ui/native-select";
import { useBranchForm } from "@/hooks/branches/use-branch-form";
import { useI18n } from "@/hooks/core/use-i18n";
import { localizedText } from "@/lib/core/booking-format.util";
import type { BranchDetail } from "@/types/branches/branch-detail.type";
import type { BrandOption } from "@/types/brands/brand-option.type";

interface BranchFormBodyProps {
  branch?: BranchDetail;
  brands: readonly BrandOption[];
  onClose: () => void;
}

/** The fields and actions of the branch dialog. A brand is chosen only when creating for an account that has several. */
export function BranchFormBody({ branch, brands, onClose }: BranchFormBodyProps): JSX.Element {
  const { dictionary, locale } = useI18n();
  const { branches: t, common } = dictionary;
  const creating = branch === undefined;
  const { form, busy, submit, confirmDelete } = useBranchForm(branch, brands[0]?.id ?? "", onClose);
  const { errors } = form.formState;

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <FormErrorBanner message={errors.root?.message} />
      {creating && brands.length > 1 ? (
        <FormField id="branch-brand" label={t.form.brand} error={errors.brand_id?.message}>
          <NativeSelect id="branch-brand" {...form.register("brand_id")}>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>{localizedText(brand.name, locale)}</option>
            ))}
          </NativeSelect>
        </FormField>
      ) : null}
      <BranchIdentityFields form={form} creating={creating} />
      <BranchStorefrontFields form={form} creating={creating} />
      <DialogFooter>
        {branch ? <Button type="button" variant="ghost" className="me-auto text-destructive" disabled={busy} onClick={confirmDelete}>{t.form.delete}</Button> : null}
        <Button type="button" variant="ghost" disabled={busy} onClick={onClose}>{common.cancel}</Button>
        <LoadingButton type="submit" loading={busy}>{creating ? t.form.create : t.form.save}</LoadingButton>
      </DialogFooter>
    </form>
  );
}
