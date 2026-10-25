import { api } from "@/services/api/client";
import { BarberEndpoints } from "@/services/api/barber-workspace/endpoints/barber-workspace.endpoints";
import type {
  TransitionBookingInput,
  CancelBookingInput,
} from "@/services/api/barber-workspace.types";

export function updateBarberWorkstation(online: boolean) {
  return api.patch<unknown>(BarberEndpoints.workstationStatus, { online });
}

export function transitionBarberBooking(
  id: string,
  transition: TransitionBookingInput["transition"],
) {
  return api.patch<unknown>(BarberEndpoints.bookingTransition(id, transition));
}

export function cancelBarberBooking(id: string, cancellationReason: string) {
  const input: CancelBookingInput = { cancellation_reason: cancellationReason };
  return api.post<unknown>(BarberEndpoints.bookingCancel(id), input);
}
