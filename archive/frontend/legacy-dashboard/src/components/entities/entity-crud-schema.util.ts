import { chairFormSchema } from "@/services/api/dashboard/chair/schemas/chair-form.schema";
import {
  branchCreateSchema,
  branchEditSchema,
} from "@/services/api/dashboard/branch/schemas/branch-form.schema";
import { serviceFormSchema } from "@/services/api/dashboard/service/schemas/service-form.schema";
import {
  stylistCreateSchema,
  stylistEditSchema,
} from "@/services/api/dashboard/stylist/schemas/stylist-form.schema";
import type { EditableDashboardResource } from "@/services/api/dashboard/shared/types/editable-dashboard-resource.types";

/** The validation schema for a resource's create/edit form. */
export function schemaFor(
  resource: EditableDashboardResource,
  editing: boolean,
):
  | typeof branchCreateSchema
  | typeof branchEditSchema
  | typeof chairFormSchema
  | typeof serviceFormSchema
  | typeof stylistCreateSchema
  | typeof stylistEditSchema {
  if (resource === "branches")
    return editing ? branchEditSchema : branchCreateSchema;
  if (resource === "chairs") return chairFormSchema;
  if (resource === "services") return serviceFormSchema;
  return editing ? stylistEditSchema : stylistCreateSchema;
}
