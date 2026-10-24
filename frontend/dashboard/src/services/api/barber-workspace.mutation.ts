import { apiRequest } from "@/services/api/client";
import { BarberEndpoints } from "@/services/api/barber-workspace/endpoints/barber-workspace.endpoints";
import type {
  TransitionBookingInput,
  CancelBookingInput,
} from "@/services/api/barber-workspace.types";

export function updateBarberWorkstation(online: boolean) {
  return apiRequest<unknown>(BarberEndpoints.workstationStatus, {
    auth: "session",
    method: "PATCH",
    body: JSON.stringify({ online }),
  });
}

export function transitionBarberBooking(
  id: string,
  transition: TransitionBookingInput["transition"],
) {
  return apiRequest<unknown>(
    BarberEndpoints.bookingTransition(id, transition),
    { auth: "session", method: "PATCH" },
  );
}

export function cancelBarberBooking(id: string, cancellationReason: string) {
  const input: CancelBookingInput = { cancellation_reason: cancellationReason };
  return apiRequest<unknown>(BarberEndpoints.bookingCancel(id), {
    auth: "session",
    method: "POST",
    body: JSON.stringify(input),
  });
}
