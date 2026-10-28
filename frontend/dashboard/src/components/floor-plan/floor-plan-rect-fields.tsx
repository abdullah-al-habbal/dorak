"use client";

import { Input } from "@/components/tailgrids/core/input";
import { useDictionary } from "@/hooks/use-dictionary";
import type { IFloorPlanLayoutInput } from "@/services/api/dashboard/floor-plan/types/ifloor-plan-layout-input.types";
import type { FieldErrors, UseFormRegister } from "react-hook-form";

const RECT_KEYS = ["x", "y", "width", "height"] as const;

interface IFloorPlanRectFieldsProps {
  register: UseFormRegister<IFloorPlanLayoutInput>;
  errors: FieldErrors<IFloorPlanLayoutInput>;
  list: "zones" | "decorations";
  index: number;
}

/** The four percent-based position/size inputs shared by zones and decorations. */
export function FloorPlanRectFields({
  register,
  errors,
  list,
  index,
}: IFloorPlanRectFieldsProps) {
  const copy = useDictionary().floorPlan;
  return RECT_KEYS.map((key) => (
    <label className="grid gap-1 text-sm text-text-100" key={key}>
      <span>{copy[key]}</span>
      <Input
        inputMode="decimal"
        state={errors[list]?.[index]?.[key] ? "error" : "default"}
        {...register(`${list}.${index}.${key}`)}
      />
    </label>
  ));
}
