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
    title: "Branches",
    columns: [
      { id: "name", label: "Name", value: (item: IBranch) => item.name.en },
      { id: "email", label: "Email", value: (item: IBranch) => item.email },
      { id: "status", label: "Status", value: (item: IBranch) => item.status },
    ],
  },
  chairs: {
    resource: "chairs",
    title: "Chairs",
    columns: [
      {
        id: "label",
        label: "Label",
        value: (item: IChair) => item.label ?? item.id,
      },
      { id: "zone", label: "Zone", value: (item: IChair) => item.floorZone },
      { id: "status", label: "Status", value: (item: IChair) => item.status },
    ],
  },
  services: {
    resource: "services",
    title: "Services",
    columns: [
      { id: "name", label: "Name", value: (item: IService) => item.name.en },
      { id: "price", label: "Price", value: (item: IService) => item.price },
      {
        id: "active",
        label: "Active",
        value: (item: IService) => (item.active ? "Active" : "Inactive"),
      },
    ],
  },
  stylists: {
    resource: "stylists",
    title: "Stylists",
    columns: [
      { id: "name", label: "Name", value: (item: IStylist) => item.name.en },
      { id: "email", label: "Email", value: (item: IStylist) => item.email },
      { id: "status", label: "Status", value: (item: IStylist) => item.status },
    ],
  },
  bookings: {
    resource: "bookings",
    title: "Bookings",
    columns: [
      {
        id: "time",
        label: "Appointment",
        value: (item: IBooking) => item.timeSlot,
      },
      { id: "status", label: "Status", value: (item: IBooking) => item.status },
      {
        id: "chair",
        label: "Chair",
        value: (item: IBooking) => item.chair?.label ?? "—",
      },
      {
        id: "stylist",
        label: "Stylist",
        value: (item: IBooking) => item.barber?.name.en ?? "—",
      },
    ],
  },
} as const satisfies Record<
  Exclude<DashboardResource, "overview">,
  EntityConfig<never>
>;
