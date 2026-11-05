import { chairFormSchema } from "@/services/api/dashboard/chair/schemas/chair-form.schema";
import { branchCreateSchema } from "@/services/api/dashboard/branch/schemas/branch-form.schema";
import { serviceFormSchema } from "@/services/api/dashboard/service/schemas/service-form.schema";
import { stylistCreateSchema } from "@/services/api/dashboard/stylist/schemas/stylist-form.schema";
import {
  mapBranchPayload,
  mapChairPayload,
  mapServicePayload,
  mapStylistPayload,
} from "@/services/api/dashboard/shared/dashboard-payload-mapper.util";
import type { EditableDashboardResource } from "@/services/api/dashboard/shared/types/editable-dashboard-resource.types";
import type { z } from "zod";

/** Maps validated form values to the API create/update payload for a resource. */
export function payloadFor(
  resource: EditableDashboardResource,
  value: unknown,
  force = false,
): unknown {
  if (resource === "branches")
    return mapBranchPayload(value as z.infer<typeof branchCreateSchema>);
  if (resource === "chairs")
    return mapChairPayload(value as z.infer<typeof chairFormSchema>, force);
  if (resource === "services")
    return mapServicePayload(value as z.infer<typeof serviceFormSchema>);
  return mapStylistPayload(value as z.infer<typeof stylistCreateSchema>);
}
