import type { UseFormReturn } from "react-hook-form";

import type { PlanFormValues } from "@/schemas/plans/plan-form.zod";

export interface PlanFieldsProps {
  form: UseFormReturn<PlanFormValues>;
}
