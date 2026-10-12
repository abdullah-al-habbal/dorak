import type { EntityConfig } from "@/components/entities/entity-config.types";
import type { DashboardResource } from "@/services/api/dashboard/dashboard-resource.types";
import type { IBooking } from "@/services/api/dashboard/ibooking.types";
import type { IBranch } from "@/services/api/dashboard/ibranch.types";
import type { IChair } from "@/services/api/dashboard/ichair.types";
import type { IService } from "@/services/api/dashboard/iservice.types";
import type { IStylist } from "@/services/api/dashboard/istylist.types";

export const ENTITY_CONFIGS = {
  branches: {
    resource: "branches",
    columns: [
      { id: "name", label: "name", value: (item: IBranch) => item.name.en },
      { id: "email", label: "email", value: (item: IBranch) => item.email },
      { id: "status", label: "status", value: (item: IBranch) => item.status },
    ],
  },
  chairs: {
    resource: "chairs",
    columns: [
      {
        id: "label",
        label: "label",
        value: (item: IChair) => item.label ?? item.id,
      },
      { id: "zone", label: "zone", value: (item: IChair) => item.floorZone },
      { id: "status", label: "status", value: (item: IChair) => item.status },
    ],
  },
  services: {
    resource: "services",
    columns: [
      { id: "name", label: "name", value: (item: IService) => item.name.en },
      { id: "price", label: "price", value: (item: IService) => item.price },
      {
        id: "active",
        label: "active",
        value: (item: IService) => (item.active ? "active" : "inactive"),
      },
    ],
  },
  stylists: {
    resource: "stylists",
    columns: [
      { id: "name", label: "name", value: (item: IStylist) => item.name.en },
      { id: "email", label: "email", value: (item: IStylist) => item.email },
      { id: "status", label: "status", value: (item: IStylist) => item.status },
    ],
  },
  bookings: {
    resource: "bookings",
    columns: [
      {
        id: "time",
        label: "appointment",
        value: (item: IBooking) => item.timeSlot,
      },
      { id: "status", label: "status", value: (item: IBooking) => item.status },
      {
        id: "chair",
        label: "chair",
        value: (item: IBooking) => item.chair?.label ?? "—",
      },
      {
        id: "stylist",
        label: "stylist",
        value: (item: IBooking) => item.barber?.name.en ?? "—",
      },
    ],
  },
} as const satisfies Record<
  Exclude<DashboardResource, "overview">,
  EntityConfig<never>
>;
