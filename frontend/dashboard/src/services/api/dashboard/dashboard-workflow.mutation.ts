import { apiRequest } from "@/services/api/client";
import type { DashboardEntityId } from "@/services/api/dashboard/dashboard-entity-id.types";

export function createDashboardEntity<TData>(
  resource: "branches" | "chairs" | "services" | "stylists",
  payload: unknown,
) {
  return apiRequest<TData>(`/api/dashboard/${resource}`, {
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
  return apiRequest<TData>(
    `/api/dashboard/${resource}/${encodeURIComponent(id)}`,
    { auth: "session", method: "PUT", body: JSON.stringify(payload) },
  );
}

export function createWalkInBooking<TData>(payload: unknown) {
  return apiRequest<TData>("/api/dashboard/bookings/walk-in", {
    auth: "session",
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function cancelBooking<TData>(id: DashboardEntityId) {
  return apiRequest<TData>(
    `/api/dashboard/bookings/${encodeURIComponent(id)}/cancel`,
    { auth: "session", method: "PATCH" },
  );
}

export function rescheduleBooking<TData>(
  id: DashboardEntityId,
  payload: unknown,
) {
  return apiRequest<TData>(
    `/api/dashboard/bookings/${encodeURIComponent(id)}/reschedule`,
    { auth: "session", method: "PATCH", body: JSON.stringify(payload) },
  );
}

export function rateBookingClient<TData>(
  id: DashboardEntityId,
  payload: unknown,
) {
  return apiRequest<TData>(
    `/api/dashboard/bookings/${encodeURIComponent(id)}/review`,
    { auth: "session", method: "POST", body: JSON.stringify(payload) },
  );
}

export function updateBookingStatus<TData>(
  id: DashboardEntityId,
  payload: unknown,
) {
  return apiRequest<TData>(
    `/api/dashboard/bookings/${encodeURIComponent(id)}`,
    { auth: "session", method: "PATCH", body: JSON.stringify(payload) },
  );
}
