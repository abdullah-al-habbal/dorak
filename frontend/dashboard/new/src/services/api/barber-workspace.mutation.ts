import { apiRequest } from "@/services/api/client";

export function updateBarberWorkstation(online: boolean) { return apiRequest<unknown>("/api/barber/workstation-status", { auth: "session", method: "PATCH", body: JSON.stringify({ online }) }); }
export function transitionBarberBooking(id: string, transition: "accept" | "start" | "complete" | "no-show") { return apiRequest<unknown>(`/api/barber/bookings/${encodeURIComponent(id)}/${transition}`, { auth: "session", method: "PATCH" }); }
export function cancelBarberBooking(id: string, cancellationReason: string) { return apiRequest<unknown>(`/api/barber/bookings/${encodeURIComponent(id)}/cancel`, { auth: "session", method: "POST", body: JSON.stringify({ cancellation_reason: cancellationReason }) }); }
