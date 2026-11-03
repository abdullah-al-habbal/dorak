import { localizedName } from "@/utils/localized-name.util";
import { fromMinorUnits } from "@/services/api/dashboard/monetization/monetization.util";
import type { EntityConfig } from "@/components/entities/entity-config.types";
import type { DashboardResource } from "@/services/api/dashboard/shared/types/dashboard-resource.types";
import type { IBooking } from "@/services/api/dashboard/booking/types/ibooking.types";
import type { IBranch } from "@/services/api/dashboard/branch/types/ibranch.types";
import type { IChair } from "@/services/api/dashboard/chair/types/ichair.types";
import type { IService } from "@/services/api/dashboard/service/types/iservice.types";
import type { IStylist } from "@/services/api/dashboard/stylist/types/istylist.types";

export const ENTITY_CONFIGS = {
  branches: {
    resource: "branches",
    hasEditRoute: true,
    columns: [
      {
        id: "name",
        label: "name",
        value: (item: IBranch, locale) => localizedName(item.name, locale),
      },
      { id: "email", label: "email", value: (item: IBranch) => item.email },
      { id: "status", label: "status", value: (item: IBranch) => item.status },
      {
        id: "rating",
        label: "rating",
        value: (item: IBranch) =>
          item.ratingAverage === null
            ? "—"
            : `★ ${item.ratingAverage} (${item.ratingCount})`,
      },
    ],
  },
  chairs: {
    resource: "chairs",
    hasEditRoute: true,
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
    hasEditRoute: true,
    columns: [
      {
        id: "name",
        label: "name",
        value: (item: IService, locale) => localizedName(item.name, locale),
      },
      {
        id: "price",
        label: "price",
        value: (item: IService) => fromMinorUnits(item.priceAmountMinor),
      },
      {
        id: "active",
        label: "active",
        value: (item: IService) => (item.isActive ? "active" : "inactive"),
      },
    ],
  },
  stylists: {
    resource: "stylists",
    hasEditRoute: true,
    columns: [
      {
        id: "name",
        label: "name",
        value: (item: IStylist, locale) => localizedName(item.name, locale),
      },
      { id: "email", label: "email", value: (item: IStylist) => item.email },
      { id: "status", label: "status", value: (item: IStylist) => item.status },
    ],
  },
  bookings: {
    resource: "bookings",
    hasEditRoute: false,
    columns: [
      {
        id: "time",
        label: "appointment",
        value: (item: IBooking) => item.startsAt,
      },
      { id: "status", label: "status", value: (item: IBooking) => item.status },
      {
        id: "chair",
        label: "chair",
        value: (item: IBooking) => item.chair?.label ?? "No chair assigned",
      },
      {
        id: "stylist",
        label: "stylist",
        value: (item: IBooking, locale) =>
          item.barber ? localizedName(item.barber.name, locale) : "—",
      },
      {
        id: "client",
        label: "client",
        value: (item: IBooking) =>
          item.client === null
            ? "—"
            : `${item.client.name ?? "—"}${
                item.client.reputation.average === null
                  ? ""
                  : ` · ★ ${item.client.reputation.average} (${item.client.reputation.count})`
              }`,
      },
    ],
  },
} as const satisfies Record<
  Exclude<DashboardResource, "overview">,
  EntityConfig<never>
>;
