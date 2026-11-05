import { localizedName } from "@/utils/localized-name.util";
import { BRANCH_STATUSES } from "@/services/api/dashboard/branch/branch.constant";
import { STYLIST_STATUSES } from "@/services/api/dashboard/stylist/stylist.constant";
import { VENUE_UNIVERSES } from "@/services/api/dashboard/shared/venue-universe.constant";
import type {
  EntityFormFieldOptions,
  IEntityFormOptionsContext,
} from "@/components/entities/entity-crud-field-options.types";

/** Select options for a field, or `null` when the field is a plain input. */
export function optionsFor(
  field: string,
  context: IEntityFormOptionsContext,
): EntityFormFieldOptions {
  const { resource, editing, fieldCopy, lookups, serviceableType, locale } =
    context;
  if (field === "status" && resource === "branches")
    return BRANCH_STATUSES.map((status) => [status, fieldCopy[status]]);
  if (field === "status" && resource === "chairs")
    return [
      ["available", fieldCopy.available],
      ["occupied", fieldCopy.occupied],
      ["maintenance", fieldCopy.maintenance],
    ];
  if (field === "status" && resource === "stylists")
    return STYLIST_STATUSES.map((status) => [status, fieldCopy[status]]);
  if (field === "universe")
    return VENUE_UNIVERSES.map((universe) => [universe, fieldCopy[universe]]);
  if (field === "floorZone")
    return [
      ["men", fieldCopy.men],
      ["women", fieldCopy.women],
      ["shared", fieldCopy.shared],
    ];
  if (field === "serviceableType")
    return [
      ["brand", fieldCopy.brand],
      ["barber", fieldCopy.barber],
    ];
  if (field === "brandId")
    return lookups.brands.map((item) => {
      const locked =
        resource === "branches" && !editing && item.branchLimitReached === true;
      return [
        item.id,
        locked
          ? `${item.label} (${fieldCopy.multiBranchRequired})`
          : item.label,
        locked,
      ];
    });
  if (field === "currencyCode")
    return lookups.currencies.map((item) => [item.id, item.label]);
  if (field === "catalogItemId")
    return [
      ["", fieldCopy.unassigned],
      ...lookups.catalogItems.map((item): [string, string] => [
        item.id,
        item.label,
      ]),
    ];
  if (field === "branchId")
    return lookups.branches.map((item) => [
      item.id,
      localizedName(item.name, locale) || item.id,
    ]);
  if (field === "serviceableId") {
    if (serviceableType === "barber")
      return lookups.stylists.map((item) => [
        item.id,
        localizedName(item.name, locale) || item.id,
      ]);
    return lookups.brands.map((item) => [item.id, item.label]);
  }
  if (field === "barberId")
    return [
      ["", fieldCopy.unassigned],
      ...lookups.stylists.map((item): [string, string] => [
        item.id,
        localizedName(item.name, locale) || item.id,
      ]),
    ];
  if (field === "chairId")
    return [
      ["", fieldCopy.unassigned],
      ...lookups.chairs.map((item): [string, string] => [
        item.id,
        item.label ?? item.id,
      ]),
    ];
  return null;
}
