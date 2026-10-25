import { api } from "@/services/api/core/client";
import type { DashboardEntityId } from "@/services/api/dashboard/shared/types/dashboard-entity-id.types";
import { DashboardEndpoints } from "@/services/api/dashboard/endpoints/dashboard.endpoints";

export function createWalkInBooking<TData>(payload: unknown) {
  return api.post<TData>(DashboardEndpoints.bookingsWalkIn, payload);
}

export function cancelBooking<TData>(id: DashboardEntityId) {
  return api.patch<TData>(DashboardEndpoints.bookingCancel(id));
}

export function rescheduleBooking<TData>(
  id: DashboardEntityId,
  payload: unknown,
) {
  return api.patch<TData>(DashboardEndpoints.bookingReschedule(id), payload);
}

export function rateBookingClient<TData>(
  id: DashboardEntityId,
  payload: unknown,
) {
  return api.post<TData>(DashboardEndpoints.bookingReview(id), payload);
}

export function updateBookingStatus<TData>(
  id: DashboardEntityId,
  payload: unknown,
) {
  return api.patch<TData>(
    DashboardEndpoints.resourceById("bookings", id),
    payload,
  );
}
