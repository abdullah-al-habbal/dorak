import type {
  EntityFormFieldOptions,
  IEntityFormOptionsContext,
} from "@/components/entities/entity-crud-field-options.types";

/** Select options for a field, or `null` when the field is a plain input. */
export function optionsFor(
  field: string,
  context: IEntityFormOptionsContext,
): EntityFormFieldOptions {
  const { resource, editing, fieldCopy, lookups, serviceableType } = context;
  if (field === "status" && resource === "branches")
    return [
      ["pending", fieldCopy.pending],
      ["enabled", fieldCopy.enabled],
      ["disabled", fieldCopy.disabled],
    ];
  if (field === "status" && resource === "chairs")
    return [
      ["available", fieldCopy.available],
      ["occupied", fieldCopy.occupied],
      ["maintenance", fieldCopy.maintenance],
    ];
  if (field === "status" && resource === "stylists")
    return [
      ["pending", fieldCopy.pending],
      ["enabled", fieldCopy.enabled],
      ["disabled", fieldCopy.disabled],
    ];
  if (field === "universe")
    return [
      ["men", fieldCopy.men],
      ["women", fieldCopy.women],
      ["unisex", fieldCopy.unisex],
    ];
  if (field === "floorZone")
    return [
      ["men", fieldCopy.men],
      ["women", fieldCopy.women],
      ["shared", fieldCopy.shared],
    ];
  if (field === "serviceableType")
    return [
      ["branch", fieldCopy.branch],
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
  if (field === "currencyId")
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
    return lookups.branches.map((item) => [item.id, item.name.en ?? item.id]);
  if (field === "serviceableId") {
    if (serviceableType === "brand")
      return lookups.brands.map((item) => [item.id, item.label]);
    if (serviceableType === "barber")
      return lookups.stylists.map((item) => [item.id, item.name.en ?? item.id]);
    return lookups.branches.map((item) => [item.id, item.name.en ?? item.id]);
  }
  if (field === "barberId")
    return [
      ["", fieldCopy.unassigned],
      ...lookups.stylists.map((item): [string, string] => [
        item.id,
        item.name.en ?? item.id,
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
