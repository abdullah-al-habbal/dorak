import type { z } from "zod";
import { toMinorUnits } from "@/services/api/dashboard/monetization/monetization.util";
import {
  branchCreateSchema,
  branchEditSchema,
} from "@/services/api/dashboard/branch/schemas/branch-form.schema";
import { openingHoursPayload } from "@/services/api/dashboard/branch/branch-opening-hours.mapper.util";
import { chairFormSchema } from "@/services/api/dashboard/chair/schemas/chair-form.schema";
import { serviceFormSchema } from "@/services/api/dashboard/service/schemas/service-form.schema";
import {
  stylistCreateSchema,
  stylistEditSchema,
} from "@/services/api/dashboard/stylist/schemas/stylist-form.schema";
import type { WalkInBookingInput } from "@/services/api/dashboard/booking/types/walk-in-booking.types";
import type { BookingRescheduleInput } from "@/services/api/dashboard/booking/types/booking-reschedule.types";

export function mapBranchPayload(
  input: z.infer<typeof branchCreateSchema> | z.infer<typeof branchEditSchema>,
) {
  return {
    brand_id: input.brandId,
    email: input.email,
    latitude: input.latitude,
    longitude: input.longitude,
    name: input.name,
    ...(input.password ? { password: input.password } : {}),
    status: input.status,
    universe: input.universe,
    description: input.description,
    address: input.address,
    ...(openingHoursPayload(input.openingHours).length > 0
      ? { opening_hours: openingHoursPayload(input.openingHours) }
      : {}),
  };
}
export function mapChairPayload(
  input: z.infer<typeof chairFormSchema>,
  force = false,
) {
  return {
    ...(force ? { force: true } : {}),
    barber_id: input.barberId,
    branch_id: input.branchId,
    floor_zone: input.floorZone,
    label: input.label,
    status: input.status,
    ui_metadata: {
      height: input.height,
      position_x: input.positionX,
      position_y: input.positionY,
      ...(input.rotation === null ? {} : { rotation: input.rotation }),
      width: input.width,
    },
  };
}
export function mapServicePayload(input: z.infer<typeof serviceFormSchema>) {
  return {
    is_active: input.isActive,
    is_at_home: input.isAtHome,
    catalog_item_id: input.catalogItemId,
    currency_code: input.currencyCode,
    duration_minutes: input.durationMinutes,
    name: input.name,
    price_amount_minor: toMinorUnits(input.price),
    serviceable_id: input.serviceableId,
    serviceable_type: input.serviceableType,
  };
}
export function mapStylistPayload(
  input:
    | z.infer<typeof stylistCreateSchema>
    | z.infer<typeof stylistEditSchema>,
) {
  return {
    chair_id: input.chairId,
    email: input.email,
    name: input.name,
    phone: input.phone,
    ...(input.password ? { password: input.password } : {}),
    status: input.status,
  };
}
export function mapWalkInBookingPayload(input: WalkInBookingInput) {
  return {
    ...(input.barberId ? { barber_id: input.barberId } : {}),
    branch_id: input.branchId,
    chair_id: input.chairId,
    customer_email: input.customerEmail,
    customer_name: input.customerName,
    ...(input.customerPhone ? { customer_phone: input.customerPhone } : {}),
    service_ids: input.serviceIds,
    time_slot: input.timeSlot,
  };
}
export function mapBookingReschedulePayload(input: BookingRescheduleInput) {
  return { ends_at: input.endsAt, time_slot: input.timeSlot };
}
