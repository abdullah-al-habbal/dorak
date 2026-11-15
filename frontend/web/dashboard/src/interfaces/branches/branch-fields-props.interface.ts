import type { UseFormReturn } from "react-hook-form";

import type { BranchFormValues } from "@/schemas/branches/branch-form.zod";

export interface BranchFieldsProps {
  form: UseFormReturn<BranchFormValues>;
  creating: boolean;
}
