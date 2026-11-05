"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import type { JSX } from "react";
import { useForm, useWatch } from "react-hook-form";

import { LoadingButton } from "@/components/buttons/loading-button";
import { FormErrorBanner } from "@/components/common/form-error-banner";
import { FormField, fieldErrorId } from "@/components/common/form-field";
import { ServiceCategoryField } from "@/components/services/service-category-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { OverlayKind } from "@/enums/overlay-kind.enum";
import { useCurrencies } from "@/hooks/use-currencies";
import { useDeleteService } from "@/hooks/use-delete-service";
import { useI18n } from "@/hooks/use-i18n";
import { useOverlay } from "@/hooks/use-overlay";
import { useSaveService } from "@/hooks/use-save-service";
import { mapApiFieldErrors } from "@/lib/api-field-errors.util";
import { DURATION_PRESETS } from "@/lib/duration.util";
import { emptyServiceForm, existingServiceOwner, formToServicePayload, newServiceOwner, serviceToForm } from "@/lib/service-form.util";
import { createServiceSchema } from "@/schemas/service-form.zod";
import type { ServiceFormValues } from "@/schemas/service-form.zod";
import type { Service } from "@/types/service.type";

interface ServiceFormDialogProps {
  service?: Service;
  brandId: string | null;
  onClose: () => void;
}

const DEFAULT_CURRENCY = "";

export function ServiceFormDialog({ service, brandId, onClose }: ServiceFormDialogProps): JSX.Element {
  const { dictionary } = useI18n();
  const { services: t, common } = dictionary;
  const f = t.form;
  const creating = service === undefined;
  const overlay = useOverlay();
  const currencies = useCurrencies();
  const save = useSaveService();
  const remove = useDeleteService();
  const schema = useMemo(() => createServiceSchema(f.validation), [f.validation]);
  const defaultCurrency = currencies.data?.find((currency) => currency.is_default)?.code ?? currencies.data?.[0]?.code ?? DEFAULT_CURRENCY;
  const form = useForm<ServiceFormValues>({ resolver: zodResolver(schema), defaultValues: service ? serviceToForm(service) : emptyServiceForm(defaultCurrency) });
  const { errors } = form.formState;
  const { getValues, setValue } = form;
  const categoryId = useWatch({ control: form.control, name: "category_id" });

  // Currencies arrive after the form mounts; pick the default once, never overwrite a choice.
  useEffect(() => {
    if (creating && defaultCurrency && !getValues("currency_code")) setValue("currency_code", defaultCurrency);
  }, [creating, defaultCurrency, getValues, setValue]);
  const busy = form.formState.isSubmitting || save.isPending;
  const invalid = (name: keyof ServiceFormValues, id: string) => ({ "aria-invalid": Boolean(errors[name]), "aria-describedby": errors[name] ? fieldErrorId(id) : undefined });

  const submit = form.handleSubmit(async (values) => {
    const owner = service ? existingServiceOwner(service) : brandId ? newServiceOwner(brandId) : null;
    if (!owner) {
      form.setError("root", { message: t.states.noBrand });
      return;
    }
    try {
      await save.mutateAsync({ id: service?.id, payload: formToServicePayload(values, owner) });
      onClose();
    } catch (error) {
      const mapped = mapApiFieldErrors(error, f.errors.generic);
      for (const [name, message] of Object.entries(mapped.fieldErrors)) form.setError(mapFieldName(name), { message });
      if (mapped.formError) form.setError("root", { message: mapped.formError });
    }
  });

  function confirmDelete(): void {
    if (!service) return;
    onClose();
    overlay.open({
      kind: OverlayKind.Confirm,
      title: t.confirm.deleteTitle,
      description: t.confirm.deleteBody,
      confirmLabel: t.confirm.delete,
      destructive: true,
      onConfirm: async () => {
        await remove.mutateAsync(service.id);
      },
    });
  }

  return (
    <Dialog open onOpenChange={(open) => (open || busy ? undefined : onClose())}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto overscroll-contain sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{creating ? f.createTitle : f.editTitle}</DialogTitle>
          <DialogDescription>{f.description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <FormErrorBanner message={errors.root?.message} />
          <FormField id="service-name-en" label={f.nameEn} error={errors.name_en?.message}>
            <Input id="service-name-en" dir="ltr" autoComplete="off" maxLength={120} {...invalid("name_en", "service-name-en")} {...form.register("name_en")} />
          </FormField>
          <FormField id="service-name-ar" label={f.nameAr} error={errors.name_ar?.message}>
            <Input id="service-name-ar" dir="rtl" autoComplete="off" maxLength={120} {...invalid("name_ar", "service-name-ar")} {...form.register("name_ar")} />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField id="service-price" label={f.price} error={errors.price?.message}>
              <Input id="service-price" inputMode="decimal" dir="ltr" autoComplete="off" {...invalid("price", "service-price")} {...form.register("price")} />
            </FormField>
            <FormField id="service-currency" label={f.currency} error={errors.currency_code?.message}>
              <NativeSelect id="service-currency" disabled={currencies.isPending} {...invalid("currency_code", "service-currency")} {...form.register("currency_code")}>
                {creating && !currencies.data ? <option value="" /> : null}
                {currencies.data?.map((currency) => (
                  <option key={currency.code} value={currency.code}>{currency.code}</option>
                ))}
              </NativeSelect>
            </FormField>
          </div>
          <ServiceCategoryField value={categoryId} onChange={(id) => setValue("category_id", id, { shouldDirty: true })} />
          <FormField id="service-duration" label={f.duration} hint={f.durationHint} error={errors.duration?.message}>
            <Input id="service-duration" inputMode="numeric" dir="ltr" autoComplete="off" list="service-duration-presets" {...invalid("duration", "service-duration")} {...form.register("duration")} />
            <datalist id="service-duration-presets">
              {DURATION_PRESETS.map((minutes) => <option key={minutes} value={minutes} />)}
            </datalist>
          </FormField>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
            <input type="checkbox" className="size-4 accent-primary" {...form.register("is_at_home")} />
            {f.atHome}
          </label>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
            <input type="checkbox" className="size-4 accent-primary" {...form.register("is_active")} />
            {f.active}
          </label>
          <DialogFooter>
            {service ? <Button type="button" variant="ghost" className="me-auto text-destructive" disabled={busy} onClick={confirmDelete}>{f.delete}</Button> : null}
            <Button type="button" variant="ghost" disabled={busy} onClick={onClose}>{common.cancel}</Button>
            <LoadingButton type="submit" loading={busy}>{creating ? f.create : f.save}</LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const SERVER_FIELD_TO_FORM: Record<string, keyof ServiceFormValues> = {
  name_en: "name_en",
  name_ar: "name_ar",
  price_amount_minor: "price",
  currency_code: "currency_code",
  category_id: "category_id",
  duration_minutes: "duration",
};

function mapFieldName(serverField: string): keyof ServiceFormValues | "root" {
  return SERVER_FIELD_TO_FORM[serverField] ?? "root";
}
