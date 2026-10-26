import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";
import type { UpdateTravelRadiusFormInput } from "@/services/api/barber-workspace/types/barber-workspace.types";
import type { UseFormReturn } from "react-hook-form";

interface IBarberTravelCardProps {
  title: string;
  editLabel: string;
  saveLabel: string;
  form: UseFormReturn<UpdateTravelRadiusFormInput>;
  onSubmit: (value: UpdateTravelRadiusFormInput) => void;
  isPending: boolean;
}

export function BarberTravelCard({
  title,
  editLabel,
  saveLabel,
  form,
  onSubmit,
  isPending,
}: IBarberTravelCardProps) {
  return (
    <section className="rounded-xl border border-border-primary bg-card-primary p-5">
      <h2 className="font-semibold text-title-50">{title}</h2>
      <form
        className="mt-3 flex items-end gap-2"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <label className="flex-1 text-sm text-text-secondary">
          {editLabel}
          <Input
            type="number"
            min={0}
            max={100}
            {...form.register("travelRadius", { valueAsNumber: true })}
          />
        </label>
        <Button type="submit" size="sm" isDisabled={isPending}>
          {saveLabel}
        </Button>
      </form>
    </section>
  );
}
