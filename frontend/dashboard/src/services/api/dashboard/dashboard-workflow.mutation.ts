import { apiRequest } from "@/services/api/client";
import type { DashboardEntityId } from "@/services/api/dashboard/dashboard-entity-id.types";
import { DashboardEndpoints } from "@/services/api/dashboard/endpoints/dashboard.endpoints";

export function createDashboardEntity<TData>(
  resource: "branches" | "chairs" | "services" | "stylists",
  payload: unknown,
) {
  return apiRequest<TData>(DashboardEndpoints.resource(resource), {
    auth: "session",
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateDashboardEntity<TData>(
  resource: "branches" | "chairs" | "services" | "stylists",
  id: DashboardEntityId,
  payload: unknown,
) {
  return apiRequest<TData>(DashboardEndpoints.resourceById(resource, id), {
    auth: "session",
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function createWalkInBooking<TData>(payload: unknown) {
  return apiRequest<TData>(DashboardEndpoints.bookingsWalkIn, {
    auth: "session",
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function cancelBooking<TData>(id: DashboardEntityId) {
  return apiRequest<TData>(DashboardEndpoints.bookingCancel(id), {
    auth: "session",
    method: "PATCH",
  });
}

export function rescheduleBooking<TData>(
  id: DashboardEntityId,
  payload: unknown,
) {
  return apiRequest<TData>(DashboardEndpoints.bookingReschedule(id), {
    auth: "session",
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function rateBookingClient<TData>(
  id: DashboardEntityId,
  payload: unknown,
) {
  return apiRequest<TData>(DashboardEndpoints.bookingReview(id), {
    auth: "session",
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateBookingStatus<TData>(
  id: DashboardEntityId,
  payload: unknown,
) {
  return apiRequest<TData>(DashboardEndpoints.resourceById("bookings", id), {
    auth: "session",
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
