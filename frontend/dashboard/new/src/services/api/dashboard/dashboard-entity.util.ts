import { mapBooking, mapBranch, mapChair, mapService, mapStylist } from "@/services/api/dashboard/dashboard-mapper.util";
import type { DashboardResource } from "@/services/api/dashboard/dashboard-resource.types";

export function mapDashboardEntity(resource: Exclude<DashboardResource, "overview">, wire: unknown) {
  switch (resource) {
    case "branches": return mapBranch(wire);
    case "chairs": return mapChair(wire);
    case "services": return mapService(wire);
    case "stylists": return mapStylist(wire);
    case "bookings": return mapBooking(wire);
  }
}
