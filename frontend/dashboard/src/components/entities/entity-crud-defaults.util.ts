import { fullWeek } from "@/services/api/dashboard/branch-opening-hours.util";
import type { EditableDashboardResource } from "@/services/api/dashboard/editable-dashboard-resource.types";

/** Default (create-mode) form values for a resource. */
export function defaultsFor(
  resource: EditableDashboardResource,
  branchId: string | null,
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
      duration: null,
      currencyId: "",
      active: true,
      atHome: false,
      serviceableId: branchId ?? "",
      serviceableType: "branch",
      catalogItemId: null,
    };
  return {
    name: { en: "", ar: "" },
    email: "",
    phone: null,
    password: "",
    chairId: null,
    status: "pending",
  };
}
