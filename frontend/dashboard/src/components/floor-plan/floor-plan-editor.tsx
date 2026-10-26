"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FloorPlanChairs } from "@/components/floor-plan/floor-plan-chairs";
import { FloorPlanEnumSelect } from "@/components/floor-plan/floor-plan-enum-select";
import { FloorPlanPreview } from "@/components/floor-plan/floor-plan-preview";
import { FloorPlanRectFields } from "@/components/floor-plan/floor-plan-rect-fields";
import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";
import { useDictionary } from "@/hooks/use-dictionary";
import { ApiClientError } from "@/services/api/core/client-error";
import {
  notifyApiError,
  notifySuccess,
} from "@/services/api/core/notifications";
import {
  FLOOR_DECORATION_TYPES,
  FLOOR_PLAN_CANVAS_UNITS,
  FLOOR_PLAN_MAX_DECORATIONS,
  FLOOR_PLAN_MAX_ZONES,
  FLOOR_PLAN_PRESETS,
  FLOOR_ZONES,
} from "@/services/api/dashboard/floor-plan/floor-plan.constant";
import {
  floorPlanQueryKey,
  updateBranchFloorPlan,
} from "@/services/api/dashboard/floor-plan/floor-plan.query";
import { floorPlanFormSchema } from "@/services/api/dashboard/floor-plan/schemas/floor-plan.schema";
import type {
  IFloorPlan,
  IFloorPlanLayout,
  IFloorPlanLayoutInput,
} from "@/services/api/dashboard/floor-plan/types/ifloor-plan.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFieldArray, useForm } from "react-hook-form";

interface IFloorPlanEditorProps {
  floorPlan: IFloorPlan;
}

const NEW_ZONE = { zone: "shared", x: 0, y: 0, width: 50, height: 50 } as const;
const NEW_DECORATION = {
  type: "waiting_area",
  x: 0,
  y: 0,
  width: 20,
  height: 20,
  label: null,
} as const;

export function FloorPlanEditor({ floorPlan }: IFloorPlanEditorProps) {
  const dictionary = useDictionary();
  const copy = dictionary.floorPlan;
  const queryClient = useQueryClient();
  const form = useForm<IFloorPlanLayoutInput, unknown, IFloorPlanLayout>({
    resolver: zodResolver(floorPlanFormSchema),
    defaultValues: floorPlan.layout,
  });
  const zones = useFieldArray({ control: form.control, name: "zones" });
  const decorations = useFieldArray({
    control: form.control,
    name: "decorations",
  });
  const { errors } = form.formState;

  const save = useMutation({
    mutationFn: (layout: IFloorPlanLayout) =>
      updateBranchFloorPlan(floorPlan.branchId, layout),
    onSuccess: async () => {
      notifySuccess(copy.saved);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: floorPlanQueryKey(floorPlan.branchId),
        }),
        queryClient.invalidateQueries({ queryKey: ["dashboard", "chairs"] }),
      ]);
    },
    onError: (error) => {
      if (error instanceof ApiClientError && error.status === 422) {
        Object.entries(error.errors ?? {}).forEach(([path, messages]) =>
          form.setError(path as never, {
            type: "server",
            message: messages[0],
          }),
        );
        return;
      }
      notifyApiError(error, dictionary);
    },
  });

  return (
    <form
      className="space-y-6"
      onSubmit={form.handleSubmit((layout) => save.mutate(layout))}
    >
      <FloorPlanPreview control={form.control} />
      <div className="grid gap-4 sm:grid-cols-4">
        <FloorPlanEnumSelect
          control={form.control}
          name="preset"
          label={copy.preset}
          options={FLOOR_PLAN_PRESETS.map((v) => [v, copy.presets[v]])}
        />
        <label className="grid gap-2 text-sm text-text-100">
          <span>{copy.canvasWidth}</span>
          <Input
            inputMode="decimal"
            state={errors.canvas?.width ? "error" : "default"}
            {...form.register("canvas.width")}
          />
        </label>
        <label className="grid gap-2 text-sm text-text-100">
          <span>{copy.canvasHeight}</span>
          <Input
            inputMode="decimal"
            state={errors.canvas?.height ? "error" : "default"}
            {...form.register("canvas.height")}
          />
        </label>
        <FloorPlanEnumSelect
          control={form.control}
          name="canvas.unit"
          label={copy.canvasUnit}
          options={FLOOR_PLAN_CANVAS_UNITS.map((v) => [v, v])}
        />
      </div>

      <fieldset className="space-y-3">
        <legend className="text-lg font-semibold text-title-50">
          {copy.zones}
        </legend>
        {zones.fields.map((field, index) => (
          <div className="grid items-end gap-3 sm:grid-cols-6" key={field.id}>
            <FloorPlanEnumSelect
              control={form.control}
              name={`zones.${index}.zone`}
              label={copy.zones}
              options={FLOOR_ZONES.map((v) => [v, copy.zoneNames[v]])}
            />
            <FloorPlanRectFields
              register={form.register}
              errors={errors}
              list="zones"
              index={index}
            />
            <Button
              type="button"
              appearance="outline"
              onPress={() => zones.remove(index)}
            >
              {copy.remove}
            </Button>
          </div>
        ))}
        {errors.zones?.message || errors.zones?.root?.message ? (
          <p className="text-input-error-focus-border" role="alert">
            {copy.unisexZonesRequired}
          </p>
        ) : null}
        <Button
          type="button"
          appearance="outline"
          isDisabled={zones.fields.length >= FLOOR_PLAN_MAX_ZONES}
          onPress={() => zones.append(NEW_ZONE)}
        >
          {copy.addZone}
        </Button>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-lg font-semibold text-title-50">
          {copy.decorations}
        </legend>
        {decorations.fields.map((field, index) => (
          <div className="grid items-end gap-3 sm:grid-cols-7" key={field.id}>
            <FloorPlanEnumSelect
              control={form.control}
              name={`decorations.${index}.type`}
              label={copy.decorations}
              options={FLOOR_DECORATION_TYPES.map((v) => [
                v,
                copy.decorationTypes[v],
              ])}
            />
            <FloorPlanRectFields
              register={form.register}
              errors={errors}
              list="decorations"
              index={index}
            />
            <label className="grid gap-1 text-sm text-text-100">
              <span>{copy.label}</span>
              <Input
                {...form.register(`decorations.${index}.label`, {
                  setValueAs: (v) => (v === "" ? null : v),
                })}
              />
            </label>
            <Button
              type="button"
              appearance="outline"
              onPress={() => decorations.remove(index)}
            >
              {copy.remove}
            </Button>
          </div>
        ))}
        <Button
          type="button"
          appearance="outline"
          isDisabled={decorations.fields.length >= FLOOR_PLAN_MAX_DECORATIONS}
          onPress={() => decorations.append(NEW_DECORATION)}
        >
          {copy.addDecoration}
        </Button>
      </fieldset>

      <Button type="submit" isDisabled={save.isPending}>
        {copy.save}
      </Button>
      <FloorPlanChairs chairs={floorPlan.chairs} />
    </form>
  );
}
