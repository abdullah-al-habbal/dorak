import type { EntityFormFieldOption } from "@/components/entities/entity-crud-form.types";
import type { Dictionary } from "@/i18n/dictionary.types";
import type { LookupOption } from "@/services/api/common/lookup/types/lookup.types";
import type { EditableDashboardResource } from "@/services/api/dashboard/shared/types/editable-dashboard-resource.types";
import type { IBranch } from "@/services/api/dashboard/branch/types/ibranch.types";
import type { IChair } from "@/services/api/dashboard/chair/types/ichair.types";
import type { IStylist } from "@/services/api/dashboard/stylist/types/istylist.types";

export interface IEntityFormOptionLookups {
  branches: readonly IBranch[];
  chairs: readonly IChair[];
  stylists: readonly IStylist[];
  brands: readonly LookupOption[];
  currencies: readonly LookupOption[];
  catalogItems: readonly LookupOption[];
}

export interface IEntityFormOptionsContext {
  resource: EditableDashboardResource;
  editing: boolean;
  fieldCopy: Dictionary["operations"]["field"];
  lookups: IEntityFormOptionLookups;
  serviceableType: string | undefined;
}

export type EntityFormFieldOptions = EntityFormFieldOption[] | null;
