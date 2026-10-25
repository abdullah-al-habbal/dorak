import { emptyToNull } from "@/components/entities/entity-form-field.util";
import { fullWeek } from "@/services/api/dashboard/branch-opening-hours.util";
import type { EditableDashboardResource } from "@/services/api/dashboard/editable-dashboard-resource.types";
import type { IBranch } from "@/services/api/dashboard/ibranch.types";
import type { IChair } from "@/services/api/dashboard/ichair.types";
import type { IService } from "@/services/api/dashboard/iservice.types";
import type { IStylist } from "@/services/api/dashboard/istylist.types";

function isBranchData(
  resource: EditableDashboardResource,
  data: unknown,
): data is IBranch {
  return resource === "branches";
}
function isChairData(
  resource: EditableDashboardResource,
  data: unknown,
): data is IChair {
  return resource === "chairs";
}
function isServiceData(
  resource: EditableDashboardResource,
  data: unknown,
): data is IService {
  return resource === "services";
}
function isStylistData(
  resource: EditableDashboardResource,
  data: unknown,
): data is IStylist {
  return resource === "stylists";
}

/** Form values to reset an edit-mode form to, mapped from the fetched entity. */
export function resetValuesFor(
  resource: EditableDashboardResource,
  current: unknown,
): Record<string, unknown> | null {
  if (isBranchData(resource, current))
    return {
      name: current.name,
      brandId: current.brandId,
      email: current.email,
      password: "",
      latitude: current.latitude,
      longitude: current.longitude,
      status: current.status,
      universe: current.universe,
      description: emptyToNull(current.description),
      address: emptyToNull(current.address),
      openingHours: fullWeek(current.openingHours),
    };
  if (isChairData(resource, current))
    return {
      label: current.label ?? "",
      branchId: current.branchId,
      barberId: current.barberId,
      floorZone: current.floorZone,
      status: current.status,
      positionX: current.positionX,
      positionY: current.positionY,
      width: current.width,
      height: current.height,
      rotation: current.rotation,
    };
  if (isServiceData(resource, current))
    return {
      name: current.name,
      price: current.price,
      duration: current.duration,
      currencyId: current.currencyId,
      active: current.active,
      atHome: current.atHome,
      serviceableId: current.serviceableId,
      serviceableType: current.serviceableType,
      catalogItemId: current.catalogItemId,
    };
  if (isStylistData(resource, current))
    return {
      name: current.name,
      email: current.email,
      phone: current.phone,
      password: "",
      chairId: current.chairId,
      status: current.status,
    };
  return null;
}
