"use client";

import { Button } from "@/components/tailgrids/core/button";
import { TextArea } from "@/components/tailgrids/core/text-area";
import type { UpdateBarberProfileFormInput } from "@/services/api/barber-workspace/types/barber-workspace.types";
import type { UseFormReturn } from "react-hook-form";

interface IBarberProfileCardProps {
  title: string;
  bioEnLabel: string;
  bioArLabel: string;
  saveLabel: string;
  form: UseFormReturn<UpdateBarberProfileFormInput>;
  onSubmit: (value: UpdateBarberProfileFormInput) => void;
  isPending: boolean;
}

export function BarberProfileCard({
  title,
  bioEnLabel,
  bioArLabel,
  saveLabel,
  form,
  onSubmit,
  isPending,
}: IBarberProfileCardProps) {
  return (
    <section className="rounded-xl border border-border-primary bg-card-primary p-5 lg:col-span-3">
      <h2 className="font-semibold text-title-50">{title}</h2>
      <form className="mt-3 space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
        <label className="grid gap-2 text-sm text-text-100">
          {bioEnLabel}
          <TextArea {...form.register("bioEn")} />
        </label>
        <label className="grid gap-2 text-sm text-text-100">
          {bioArLabel}
          <TextArea {...form.register("bioAr")} />
        </label>
        <Button type="submit" size="sm" isDisabled={isPending}>
          {saveLabel}
        </Button>
      </form>
    </section>
  );
}
