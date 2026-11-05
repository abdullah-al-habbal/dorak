import type { EditableDashboardResource } from "@/services/api/dashboard/shared/types/editable-dashboard-resource.types";

export interface IEntityCrudFormProps {
  resource: EditableDashboardResource;
  id?: string;
}

/** `[value, label, isDisabled?]` tuple rendered as a select option. */
export type EntityFormFieldOption = readonly [string, string, boolean?];
