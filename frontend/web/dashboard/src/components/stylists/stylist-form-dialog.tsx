"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import type { JSX } from "react";
import { useForm } from "react-hook-form";

import { LoadingButton } from "@/components/buttons/loading-button";
import { FormErrorBanner } from "@/components/common/form-error-banner";
import { FormField, fieldErrorId } from "@/components/common/form-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { AuthActor } from "@/enums/access/auth-actor.enum";
import { OverlayKind } from "@/enums/ui/overlay-kind.enum";
import { useChairOptions } from "@/hooks/chairs/use-chair-options";
import { useDeleteStylist } from "@/hooks/stylists/roster/use-delete-stylist";
import { useI18n } from "@/hooks/core/state/use-i18n";
import { useOverlay } from "@/hooks/core/state/use-overlay";
import { useSaveStylist } from "@/hooks/stylists/roster/use-save-stylist";
import { useAuthStore } from "@/store/auth.store";
import { mapApiFieldErrors } from "@/lib/core/errors/api-field-errors.util";
import { localizedText } from "@/lib/core/format/booking-format.util";
import { emptyStylistForm, formToStylistPayload, stylistToForm } from "@/lib/stylists/stylist-form.util";
import { createStylistSchema } from "@/schemas/stylists/stylist-form.zod";
import type { StylistFormValues } from "@/schemas/stylists/stylist-form.zod";
import type { Stylist } from "@/types/stylists/stylist.type";

interface StylistFormDialogProps {
  stylist?: Stylist;
  onClose: () => void;
}

export function StylistFormDialog({ stylist, onClose }: StylistFormDialogProps): JSX.Element {
  const { locale, dictionary } = useI18n();
  const { stylists: t, common } = dictionary;
  const f = t.form;
  const creating = stylist === undefined;
  const overlay = useOverlay();
  const isOwner = useAuthStore((state) => state.actor) === AuthActor.Owner;
  const chairs = useChairOptions();
  const save = useSaveStylist();
  const remove = useDeleteStylist();
  const schema = useMemo(() => createStylistSchema(f.validation, creating), [f.validation, creating]);
  const form = useForm<StylistFormValues>({ resolver: zodResolver(schema), defaultValues: stylist ? stylistToForm(stylist) : emptyStylistForm() });
  const { errors } = form.formState;
  const busy = form.formState.isSubmitting || save.isPending;
  const invalid = (name: keyof StylistFormValues, id: string) => ({ "aria-invalid": Boolean(errors[name]), "aria-describedby": errors[name] ? fieldErrorId(id) : undefined });

  const submit = form.handleSubmit(async (values) => {
    try {
      await save.mutateAsync({ id: stylist?.id, payload: formToStylistPayload(values) });
      onClose();
    } catch (error) {
      const mapped = mapApiFieldErrors(error, f.errors.generic);
      for (const [name, message] of Object.entries(mapped.fieldErrors)) form.setError(name as keyof StylistFormValues, { message });
      if (mapped.formError) form.setError("root", { message: mapped.formError });
    }
  });

  function confirmDelete(): void {
    if (!stylist) return;
    onClose();
    overlay.open({
      kind: OverlayKind.Confirm,
      title: t.confirm.deleteTitle,
      description: t.confirm.deleteBody,
      confirmLabel: t.confirm.delete,
      destructive: true,
      onConfirm: async () => {
        await remove.mutateAsync(stylist.id);
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
          <FormField id="stylist-name-en" label={f.nameEn} error={errors.name_en?.message}>
            <Input id="stylist-name-en" dir="ltr" autoComplete="off" maxLength={120} {...invalid("name_en", "stylist-name-en")} {...form.register("name_en")} />
          </FormField>
          <FormField id="stylist-name-ar" label={f.nameAr} error={errors.name_ar?.message}>
            <Input id="stylist-name-ar" dir="rtl" autoComplete="off" maxLength={120} {...invalid("name_ar", "stylist-name-ar")} {...form.register("name_ar")} />
          </FormField>
          <FormField id="stylist-email" label={f.email} error={errors.email?.message}>
            <Input id="stylist-email" type="email" dir="ltr" spellCheck={false} autoComplete="off" maxLength={255} {...invalid("email", "stylist-email")} {...form.register("email")} />
          </FormField>
          <FormField id="stylist-phone" label={f.phone} hint={common.fields.optional} error={errors.phone?.message}>
            <Input id="stylist-phone" type="tel" dir="ltr" autoComplete="off" maxLength={30} {...form.register("phone")} />
          </FormField>
          <FormField id="stylist-password" label={f.password} hint={creating ? f.passwordHint : `${common.fields.optional}, ${f.passwordHint}`} error={errors.password?.message}>
            <Input id="stylist-password" type="password" dir="ltr" autoComplete="new-password" maxLength={255} {...invalid("password", "stylist-password")} {...form.register("password")} />
          </FormField>
          <FormField id="stylist-chair" label={f.chair} error={errors.chair_id?.message}>
            <NativeSelect id="stylist-chair" disabled={chairs.isPending} {...form.register("chair_id")}>
              <option value="">{f.noChair}</option>
              {chairs.data?.map((chair) => (
                <option key={chair.id} value={chair.id}>{localizedText(chair.label, locale) || chair.id}</option>
              ))}
            </NativeSelect>
          </FormField>
          <DialogFooter>
            {stylist && isOwner ? <Button type="button" variant="outline" disabled={busy} onClick={() => { onClose(); overlay.open({ kind: OverlayKind.StylistPricing, stylist }); }}>{dictionary.stylistPricing.open}</Button> : null}
            {stylist ? <Button type="button" variant="ghost" className="me-auto text-destructive" disabled={busy} onClick={confirmDelete}>{f.delete}</Button> : null}
            <Button type="button" variant="ghost" disabled={busy} onClick={onClose}>{common.cancel}</Button>
            <LoadingButton type="submit" loading={busy}>{creating ? f.create : f.save}</LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
