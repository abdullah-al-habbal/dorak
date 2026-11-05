"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import type { JSX } from "react";
import { useForm } from "react-hook-form";

import { WalkInServicePicker } from "@/components/bookings/walk-in-service-picker";
import { FormErrorBanner } from "@/components/common/form-error-banner";
import { FormField, fieldErrorId } from "@/components/common/form-field";
import { LoadingButton } from "@/components/buttons/loading-button";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { useChairOptions } from "@/hooks/use-chair-options";
import { useCreateWalkIn } from "@/hooks/use-create-walk-in";
import { useI18n } from "@/hooks/use-i18n";
import { useServiceOptions } from "@/hooks/use-service-options";
import { defaultWalkInStart, localInputToUtcIso } from "@/lib/booking-datetime.util";
import { mapBookingFormError } from "@/lib/booking-form-error.util";
import { localizedText } from "@/lib/booking-format.util";
import { createWalkInSchema } from "@/schemas/walk-in-form.zod";
import type { WalkInFormValues } from "@/schemas/walk-in-form.zod";

const START_FIELD = "starts_at";

export function WalkInDialog({ onClose }: { onClose: () => void }): JSX.Element {
  const { locale, dictionary } = useI18n();
  const { bookings: t, common } = dictionary;
  const w = t.walkIn;
  const chairs = useChairOptions();
  const services = useServiceOptions(true);
  const mutation = useCreateWalkIn();
  const schema = useMemo(() => createWalkInSchema(w.validation), [w.validation]);

  const form = useForm<WalkInFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { customer_name: "", customer_email: "", customer_phone: "", chair_id: "", service_ids: [], starts_at: defaultWalkInStart(new Date()) },
  });
  const { errors, isSubmitting } = form.formState;
  const formError = errors.root?.message;

  const submit = form.handleSubmit(async (values) => {
    const chair = chairs.data?.find((item) => item.id === values.chair_id);
    if (!chair?.branch_id) {
      form.setError("chair_id", { message: w.validation.chair });
      return;
    }
    try {
      await mutation.mutateAsync({
        branch_id: chair.branch_id,
        chair_id: values.chair_id,
        customer_name: values.customer_name.trim(),
        customer_email: values.customer_email.trim(),
        customer_phone: values.customer_phone?.trim() || undefined,
        service_ids: values.service_ids,
        starts_at: localInputToUtcIso(values.starts_at),
      });
      onClose();
    } catch (error) {
      const mapped = mapBookingFormError(error, w.errors, START_FIELD);
      for (const [name, message] of Object.entries(mapped.fieldErrors)) {
        form.setError(name as keyof WalkInFormValues, { message });
      }
      if (mapped.formError) form.setError("root", { message: mapped.formError });
    }
  });

  const loadFailed = chairs.isError || services.isError;
  const busy = isSubmitting || mutation.isPending;
  const describe = (id: string, error?: string): string | undefined => (error ? fieldErrorId(id) : undefined);

  return (
    <Dialog open onOpenChange={(open) => (open || busy ? undefined : onClose())}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto overscroll-contain sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{w.title}</DialogTitle>
          <DialogDescription>{w.description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <FormErrorBanner message={formError ?? (loadFailed ? w.loadError : undefined)} />
          <FormField id="walk-in-name" label={w.name} error={errors.customer_name?.message}>
            <Input id="walk-in-name" autoComplete="off" maxLength={120} aria-invalid={Boolean(errors.customer_name)} aria-describedby={describe("walk-in-name", errors.customer_name?.message)} {...form.register("customer_name")} />
          </FormField>
          <FormField id="walk-in-email" label={w.email} error={errors.customer_email?.message}>
            <Input id="walk-in-email" type="email" dir="ltr" spellCheck={false} autoComplete="off" maxLength={255} aria-invalid={Boolean(errors.customer_email)} aria-describedby={describe("walk-in-email", errors.customer_email?.message)} {...form.register("customer_email")} />
          </FormField>
          <FormField id="walk-in-phone" label={w.phone} hint={common.fields.optional} error={errors.customer_phone?.message}>
            <Input id="walk-in-phone" type="tel" dir="ltr" autoComplete="off" maxLength={30} {...form.register("customer_phone")} />
          </FormField>
          <FormField id="walk-in-chair" label={w.chair} error={errors.chair_id?.message}>
            <NativeSelect id="walk-in-chair" disabled={chairs.isPending} aria-invalid={Boolean(errors.chair_id)} aria-describedby={describe("walk-in-chair", errors.chair_id?.message)} {...form.register("chair_id")}>
              <option value="">{w.chairPlaceholder}</option>
              {chairs.data?.map((chair) => (
                <option key={chair.id} value={chair.id}>{localizedText(chair.label, locale) || chair.id}</option>
              ))}
            </NativeSelect>
          </FormField>
          <WalkInServicePicker control={form.control} services={services.data} loading={services.isPending} error={errors.service_ids?.message} />
          <FormField id="walk-in-start" label={w.time} error={errors.starts_at?.message}>
            <Input id="walk-in-start" type="datetime-local" dir="ltr" aria-invalid={Boolean(errors.starts_at)} aria-describedby={describe("walk-in-start", errors.starts_at?.message)} {...form.register("starts_at")} />
          </FormField>
          <DialogFooter>
            <Button type="button" variant="ghost" disabled={busy} onClick={onClose}>{common.cancel}</Button>
            <LoadingButton type="submit" loading={busy} disabled={loadFailed}>{w.submit}</LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
