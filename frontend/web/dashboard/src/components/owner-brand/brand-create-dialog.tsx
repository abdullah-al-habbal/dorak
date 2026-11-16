"use client";

import type { JSX } from "react";

import { LoadingButton } from "@/components/buttons/loading-button";
import { FormErrorBanner } from "@/components/common/form-error-banner";
import { FormField, fieldErrorId } from "@/components/common/form-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { VenueUniverse } from "@/enums/people/venue-universe.enum";
import { UPLOAD_IMAGE_ACCEPT } from "@/config/upload.constant";
import { NativeSelect } from "@/components/ui/native-select";
import { BRAND_MAX_NAME } from "@/config/platform/admin-brand.constant";
import { OWNER_BRANCH_NAME_MAX } from "@/config/venue/owner-brand.constant";
import { useBrandCreateForm } from "@/hooks/brands/owner/use-brand-create-form";
import { useCurrencies } from "@/hooks/platform/currencies/use-currencies";
import { useI18n } from "@/hooks/core/state/use-i18n";
import { localizedText } from "@/lib/core/format/booking-format.util";
import type { BrandCreateFormValues } from "@/schemas/brands/brand-create-form.zod";

/** Adds another brand to the owner's account. It starts pending, like the first one. */
export function BrandCreateDialog({ onClose }: { onClose: () => void }): JSX.Element {
  const { dictionary, locale } = useI18n();
  const { ownerBrand: t, common } = dictionary;
  const currencies = useCurrencies();
  const { form, busy, logo, submit } = useBrandCreateForm(onClose);
  const { errors } = form.formState;
  const invalid = (name: keyof BrandCreateFormValues, id: string) => ({ "aria-invalid": Boolean(errors[name]), "aria-describedby": errors[name] ? fieldErrorId(id) : undefined });

  return (
    <Dialog open onOpenChange={(open) => (open || busy ? undefined : onClose())}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto overscroll-contain sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t.create.title}</DialogTitle>
          <DialogDescription>{t.create.description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <FormErrorBanner message={errors.root?.message} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField id="new-brand-name-en" label={t.create.nameEn} error={errors.name_en?.message}>
              <Input id="new-brand-name-en" dir="ltr" autoComplete="off" maxLength={BRAND_MAX_NAME} {...invalid("name_en", "new-brand-name-en")} {...form.register("name_en")} />
            </FormField>
            <FormField id="new-brand-name-ar" label={t.create.nameAr} error={errors.name_ar?.message}>
              <Input id="new-brand-name-ar" dir="rtl" lang="ar" autoComplete="off" maxLength={BRAND_MAX_NAME} {...invalid("name_ar", "new-brand-name-ar")} {...form.register("name_ar")} />
            </FormField>
          </div>
          <FormField id="new-brand-currency" label={t.create.currency} error={errors.currency?.message}>
            <NativeSelect id="new-brand-currency" {...invalid("currency", "new-brand-currency")} {...form.register("currency")}>
              <option value="">{t.create.currencyPlaceholder}</option>
              {currencies.data?.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.name ? `${localizedText(currency.name, locale)} (${currency.code})` : currency.code}
                </option>
              ))}
            </NativeSelect>
          </FormField>
          <FormField id="new-brand-universe" label={t.create.universe}>
            <NativeSelect id="new-brand-universe" {...form.register("universe")}>
              {Object.values(VenueUniverse).map((value) => (
                <option key={value} value={value}>{dictionary.branches.universe[value]}</option>
              ))}
            </NativeSelect>
          </FormField>
          <FormField id="new-brand-logo" label={t.create.logo} hint={t.create.logoHint} error={logo.error}>
            <Input id="new-brand-logo" type="file" accept={UPLOAD_IMAGE_ACCEPT} aria-invalid={Boolean(logo.error)} aria-describedby={logo.error ? fieldErrorId("new-brand-logo") : undefined} onChange={logo.onPick} />
          </FormField>
          <p className="text-sm text-muted-foreground">{t.create.branchHint}</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField id="new-branch-en" label={t.create.branchEn} error={errors.branch_en?.message}>
              <Input id="new-branch-en" dir="ltr" autoComplete="off" maxLength={OWNER_BRANCH_NAME_MAX} {...invalid("branch_en", "new-branch-en")} {...form.register("branch_en")} />
            </FormField>
            <FormField id="new-branch-ar" label={t.create.branchAr} error={errors.branch_ar?.message}>
              <Input id="new-branch-ar" dir="rtl" lang="ar" autoComplete="off" maxLength={OWNER_BRANCH_NAME_MAX} {...invalid("branch_ar", "new-branch-ar")} {...form.register("branch_ar")} />
            </FormField>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" disabled={busy} onClick={onClose}>{common.cancel}</Button>
            <LoadingButton type="submit" loading={busy}>{t.create.submit}</LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
