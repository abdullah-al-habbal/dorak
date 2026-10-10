import type { DashboardEntityId } from "@/services/api/dashboard/dashboard-entity-id.types";

export interface IChair {
  id: DashboardEntityId;
  barberId: DashboardEntityId | null;
  branchId: DashboardEntityId;
  floorZone: "men" | "women" | "shared";
  label: string | null;
  status: "available" | "occupied" | "maintenance";
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  rotation: number | null;
}
