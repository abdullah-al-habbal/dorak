import type { IBooking } from "@/services/api/dashboard/booking/types/ibooking.types";
import type { IBookingStatusLog } from "@/services/api/dashboard/booking/types/ibooking-status-log.types";
import type { IBranch } from "@/services/api/dashboard/branch/types/ibranch.types";
import type { IChair } from "@/services/api/dashboard/chair/types/ichair.types";
import type { IDashboardOverview } from "@/services/api/dashboard/shared/types/idashboard-overview.types";
import type { IService } from "@/services/api/dashboard/service/types/iservice.types";
import {
  STYLIST_STATUS,
  STYLIST_STATUSES,
} from "@/services/api/dashboard/stylist/stylist.constant";
import { isOneOf } from "@/utils/guards.util";
import type { IStylist } from "@/services/api/dashboard/stylist/types/istylist.types";

type WireRecord = Record<string, unknown>;

function record(value: unknown): WireRecord {
  return value !== null && typeof value === "object"
    ? (value as WireRecord)
    : {};
}
function string(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}
function nullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}
function localized(value: unknown) {
  const item = record(value);
  return { en: string(item.en), ar: string(item.ar) };
}

export function mapBranch(wire: unknown): IBranch {
  const item = record(wire);
  const number = (value: unknown) =>
    typeof value === "number"
      ? value
      : typeof value === "string" && value !== ""
        ? Number(value)
        : null;
  return {
    id: string(item.id),
    brandId: string(item.brand_id),
    email: string(item.email),
    latitude: number(item.latitude),
    longitude: number(item.longitude),
    name: localized(item.name),
    description: localized(item.description),
    address: localized(item.address),
    tags: Array.isArray(item.tags) ? item.tags.map((tag) => String(tag)) : [],
    openingHours: (Array.isArray(item.opening_hours)
      ? item.opening_hours
      : []
    ).map((day) => {
      const row = record(day);
      const time = (value: unknown) =>
        typeof value === "string" && value !== "" ? value.slice(0, 5) : null;
      return {
        dayOfWeek: Number(row.day_of_week),
        isClosed: row.is_closed === true || row.is_closed === 1,
        opensTime: time(row.opens_time),
        closesTime: time(row.closes_time),
      };
    }),
    ratingAverage: number(item.rating_average),
    ratingCount: number(item.rating_count) ?? 0,
    status: string(item.status, "pending") as IBranch["status"],
    universe: string(item.universe, "unisex") as IBranch["universe"],
  };
}

export function mapChair(wire: unknown): IChair {
  const item = record(wire);
  const barber = record(item.barber);
  const uiMetadata = record(item.ui_metadata);
  return {
    id: string(item.id),
    barberId: nullableString(barber.id),
    branchId: string(item.branch_id),
    floorZone: string(item.floor_zone, "shared") as IChair["floorZone"],
    label: nullableString(item.label),
    status: string(
      item.availability ?? item.status,
      "available",
    ) as IChair["status"],
    positionX: Number(uiMetadata.position_x ?? 0),
    positionY: Number(uiMetadata.position_y ?? 0),
    width: Number(uiMetadata.width ?? 1),
    height: Number(uiMetadata.height ?? 1),
    rotation:
      typeof uiMetadata.rotation === "number" ? uiMetadata.rotation : null,
  };
}

export function mapService(wire: unknown): IService {
  const item = record(wire);
  return {
    id: string(item.id),
    isActive: item.is_active === true,
    isAtHome: item.is_at_home === true,
    catalogItemId: nullableString(item.catalog_item_id),
    currencyCode: string(item.currency_code),
    durationMinutes:
      typeof item.duration_minutes === "number" ? item.duration_minutes : null,
    name: localized(item.name),
    priceAmountMinor:
      typeof item.price_amount_minor === "number" ? item.price_amount_minor : 0,
    serviceableId: string(item.serviceable_id),
    serviceableType: string(
      item.serviceable_type,
      "brand",
    ) as IService["serviceableType"],
  };
}

export function mapStylist(wire: unknown): IStylist {
  const item = record(wire);
  return {
    id: string(item.id),
    chairId: nullableString(item.chair_id),
    email: string(item.email),
    name: localized(item.name),
    phone: nullableString(item.phone),
    status: isOneOf(STYLIST_STATUSES, item.status)
      ? item.status
      : STYLIST_STATUS.pending,
  };
}

function mapBookingClient(wire: unknown): IBooking["client"] {
  if (wire === null || typeof wire !== "object") return null;
  const client = record(wire);
  const name = client.name;
  const reputation = record(client.reputation);
  return {
    name:
      typeof name === "string"
        ? name
        : nullableString(record(name).en ?? record(name).ar),
    reputation: {
      average:
        typeof reputation.average === "number" ? reputation.average : null,
      count: typeof reputation.count === "number" ? reputation.count : 0,
    },
  };
}

export function mapBooking(wire: unknown): IBooking {
  const item = record(wire);
  const barber = record(item.barber);
  const chair = record(item.chair);
  const services = Array.isArray(item.services)
    ? item.services.map((service) => ({
        name: { en: string(record(record(service).name).en) },
      }))
    : [];
  return {
    id: string(item.id),
    barber:
      item.barber === null
        ? null
        : { name: { en: string(record(barber.name).en) } },
    chair: item.chair === null ? null : { label: nullableString(chair.label) },
    client: mapBookingClient(item.client),
    endsAt: nullableString(item.ends_at),
    services,
    status: string(item.booking_status, "pending") as IBooking["status"],
    startsAt: string(item.starts_at),
  };
}

export function mapBookingStatusLog(wire: unknown): IBookingStatusLog {
  const item = record(wire);
  return {
    id: string(item.id),
    fromStatus: nullableString(item.from_status),
    toStatus: string(item.to_status),
    actorType: string(
      item.actor_type,
      "system",
    ) as IBookingStatusLog["actorType"],
    actorId: nullableString(item.actor_id),
    reason: nullableString(item.reason),
    createdAt: nullableString(item.created_at),
  };
}

export function mapDashboardOverview(wire: unknown): IDashboardOverview {
  const item = record(wire);
  const count = (value: unknown) =>
    typeof value === "number" ? value : Number(value ?? 0);
  return {
    activeChairsCount: count(item.active_chairs_count),
    activeBranchesCount: count(item.active_branches_count),
    bookingsCount: count(item.bookings_count),
    completedBookingsCount: count(item.completed_bookings_count),
    revenue: count(item.revenue),
    revenueCurrency: nullableString(item.revenue_currency),
    stylistsCount: count(item.stylists_count),
    todayBookingsCount: count(item.today_bookings_count),
  };
}
