import { api } from "@/services/api/core/client";
import {
  cancelPayload,
  schedulePayload,
  travelRadiusPayload,
} from "@/services/api/barber-workspace/barber-workspace.mapper.util";
import { BarberEndpoints } from "@/services/api/barber-workspace/endpoints/barber-workspace.endpoints";
import type {
  TransitionBookingInput,
  UpdateScheduleFormInput,
  UpdateTravelRadiusFormInput,
  UpdateBarberProfileFormInput,
} from "@/services/api/barber-workspace/types/barber-workspace.types";

export function updateBarberWorkstation(online: boolean) {
  return api.patch<void>(BarberEndpoints.workstationStatus, { online });
}

export function transitionBarberBooking(
  id: string,
  transition: TransitionBookingInput["transition"],
) {
  return api.patch<void>(BarberEndpoints.bookingTransition(id, transition));
}

export function cancelBarberBooking(id: string, cancellationReason: string) {
  return api.post<void>(
    BarberEndpoints.bookingCancel(id),
    cancelPayload(cancellationReason),
  );
}

export function updateBarberSchedule(input: UpdateScheduleFormInput) {
  return api.patch<void>(BarberEndpoints.schedule, schedulePayload(input));
}

export function updateBarberTravelRadius(input: UpdateTravelRadiusFormInput) {
  return api.patch<void>(
    BarberEndpoints.travelRadius,
    travelRadiusPayload(input),
  );
}

export function updateBarberProfile(input: UpdateBarberProfileFormInput) {
  return api.patch<void>(BarberEndpoints.profile, {
    bio: { en: input.bioEn ?? null, ar: input.bioAr ?? null },
  });
}

export function uploadBarberPortfolioPhoto(file: File) {
  const formData = new FormData();
  formData.append("photo", file);
  return api.upload<{ id: string; url: string; sort_order: number }>(
    BarberEndpoints.portfolio,
    formData,
  );
}

export function deleteBarberPortfolioPhoto(id: string) {
  return api.delete<void>(BarberEndpoints.portfolioPhoto(id));
}
