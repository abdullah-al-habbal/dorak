import { chairFormSchema } from "@/services/api/dashboard/chair-form.schema";
import { branchCreateSchema } from "@/services/api/dashboard/branch-form.schema";
import { serviceFormSchema } from "@/services/api/dashboard/service-form.schema";
import { stylistCreateSchema } from "@/services/api/dashboard/stylist-form.schema";
import {
  mapBranchPayload,
  mapChairPayload,
  mapServicePayload,
  mapStylistPayload,
} from "@/services/api/dashboard/dashboard-payload-mapper.util";
import type { EditableDashboardResource } from "@/services/api/dashboard/editable-dashboard-resource.types";
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
