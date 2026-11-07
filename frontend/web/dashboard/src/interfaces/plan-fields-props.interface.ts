import type { UseFormReturn } from "react-hook-form";

import type { PlanFormValues } from "@/schemas/plan-form.zod";

export interface PlanFieldsProps {
  form: UseFormReturn<PlanFormValues>;
}
