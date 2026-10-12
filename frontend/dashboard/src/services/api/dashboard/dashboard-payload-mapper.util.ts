import type { z } from "zod";
import {
  branchCreateSchema,
  branchEditSchema,
} from "@/services/api/dashboard/branch-form.schema";
import { chairFormSchema } from "@/services/api/dashboard/chair-form.schema";
import { serviceFormSchema } from "@/services/api/dashboard/service-form.schema";
import {
  stylistCreateSchema,
  stylistEditSchema,
} from "@/services/api/dashboard/stylist-form.schema";
import type { WalkInBookingInput } from "@/services/api/dashboard/walk-in-booking.types";
import type { BookingRescheduleInput } from "@/services/api/dashboard/booking-reschedule.types";

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
  };
}
export function mapChairPayload(input: z.infer<typeof chairFormSchema>) {
  return {
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
    active: input.active,
    catalog_item_id: input.catalogItemId,
    currency_id: input.currencyId,
    duration: input.duration,
    name: input.name,
    price: input.price,
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
