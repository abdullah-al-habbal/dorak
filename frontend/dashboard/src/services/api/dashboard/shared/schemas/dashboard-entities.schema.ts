import { z } from "zod";
import {
  LocalizedNameSchema,
  DashboardEntityIdSchema,
} from "@/services/api/dashboard/shared/schemas/dashboard-common.schema";

export const BranchOpeningDaySchema = z.object({
  weekday: z.number(),
  isClosed: z.boolean(),
  opensAt: z.string().nullable(),
  closesAt: z.string().nullable(),
});

export const BranchSchema = z.object({
  id: DashboardEntityIdSchema,
  brandId: z.string(),
  email: z.string(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  name: LocalizedNameSchema,
  description: LocalizedNameSchema,
  address: LocalizedNameSchema,
  tags: z.array(z.string()),
  openingHours: z.array(BranchOpeningDaySchema),
  ratingAvg: z.number().nullable(),
  ratingCount: z.number(),
  status: z.enum(["pending", "enabled", "disabled"]),
  universe: z.enum(["men", "women", "unisex"]),
});

export const ServiceSchema = z.object({
  id: DashboardEntityIdSchema,
  isActive: z.boolean(),
  isAtHome: z.boolean(),
  catalogItemId: z.string().nullable(),
  currencyId: DashboardEntityIdSchema,
  duration: z.number().nullable(),
  name: LocalizedNameSchema,
  price: z.number(),
  serviceableId: DashboardEntityIdSchema,
  serviceableType: z.enum(["brand", "barber"]),
});

export const ChairSchema = z.object({
  id: DashboardEntityIdSchema,
  barberId: DashboardEntityIdSchema.nullable(),
  branchId: DashboardEntityIdSchema,
  floorZone: z.enum(["men", "women", "shared"]),
  label: z.string().nullable(),
  status: z.enum(["available", "occupied", "maintenance"]),
  positionX: z.number(),
  positionY: z.number(),
  width: z.number(),
  height: z.number(),
  rotation: z.number().nullable(),
});

export const StylistSchema = z.object({
  id: DashboardEntityIdSchema,
  email: z.string(),
  chairId: DashboardEntityIdSchema.nullable(),
  name: LocalizedNameSchema,
  phone: z.string().nullable(),
  status: z.enum(["pending", "enabled", "disabled"]),
});

export const BookingSchema = z.object({
  id: DashboardEntityIdSchema,
  barber: z.object({ name: LocalizedNameSchema.pick({ en: true }) }).nullable(),
  chair: z.object({ label: z.string().nullable() }).nullable(),
  client: z
    .object({
      name: z.string().nullable(),
      reputation: z.object({
        average: z.number().nullable(),
        count: z.number(),
      }),
    })
    .nullable(),
  endsAt: z.string().nullable(),
  services: z.array(z.object({ name: LocalizedNameSchema.pick({ en: true }) })),
  status: z.enum([
    "pending",
    "confirmed",
    "in_progress",
    "completed",
    "canceled",
    "no_show",
  ]),
  timeSlot: z.string(),
});

export const BookingStatusLogSchema = z.object({
  id: DashboardEntityIdSchema,
  fromStatus: z.string().nullable(),
  toStatus: z.string(),
  actorType: z.enum(["client", "barber", "branch", "admin", "owner", "system"]),
  actorId: z.string().nullable(),
  reason: z.string().nullable(),
  createdAt: z.string().nullable(),
});
