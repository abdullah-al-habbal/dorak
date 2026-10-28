import type {
  CancelBookingInput,
  UpdateScheduleFormInput,
  UpdateTravelRadiusFormInput,
} from "@/services/api/barber-workspace/types/barber-workspace.types";

export function cancelPayload(cancellationReason: string): CancelBookingInput {
  return { cancellation_reason: cancellationReason };
}

export function schedulePayload(input: UpdateScheduleFormInput) {
  return {
    schedule: input.schedule.map((entry) => ({
      day_of_week: entry.dayOfWeek,
      start_time: entry.startTime,
      end_time: entry.endTime,
      is_active: entry.isActive,
    })),
  };
}

export function travelRadiusPayload(input: UpdateTravelRadiusFormInput) {
  return { travel_radius: input.travelRadius };
}
