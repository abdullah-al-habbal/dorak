import { fullWeek } from "@/services/api/dashboard/branch/branch-opening-hours.util";
import { STYLIST_STATUS } from "@/services/api/dashboard/stylist/stylist.constant";
import type { EditableDashboardResource } from "@/services/api/dashboard/shared/types/editable-dashboard-resource.types";

/** Default (create-mode) form values for a resource. */
export function defaultsFor(
  resource: EditableDashboardResource,
  branchId: string | null,
  brandId: string | null,
): Record<string, unknown> {
  if (resource === "branches")
    return {
      name: { en: "", ar: "" },
      brandId: "",
      email: "",
      password: "",
      latitude: null,
      longitude: null,
      status: "pending",
      universe: "unisex",
      description: { en: null, ar: null },
      address: { en: null, ar: null },
      openingHours: fullWeek(),
    };
  if (resource === "chairs")
    return {
      label: "",
      branchId: branchId ?? "",
      barberId: null,
      floorZone: "shared",
      status: "available",
      positionX: 0,
      positionY: 0,
      width: 1,
      height: 1,
      rotation: null,
    };
  if (resource === "services")
    return {
      name: { en: "", ar: "" },
      price: 0,
      durationMinutes: null,
      currencyCode: "",
      isActive: true,
      isAtHome: false,
      serviceableId: brandId ?? "",
      serviceableType: "brand",
      catalogItemId: null,
    };
  return {
    name: { en: "", ar: "" },
    email: "",
    phone: null,
    password: "",
    chairId: null,
    status: STYLIST_STATUS.pending,
  };
}
