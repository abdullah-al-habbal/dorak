import { api } from "@/services/api/core/client";
import { BarberEndpoints } from "@/services/api/barber-workspace/endpoints/barber-workspace.endpoints";
import type {
  BarberAppointment,
  BarberScheduleEntry,
  BarberWorkspaceProfile,
} from "@/services/api/barber-workspace/types/barber-workspace.types";

function mapAppointment(value: Record<string, unknown>): BarberAppointment {
  return {
    id: String(value.id),
    status: String(value.booking_status),
    startsAt: String(value.starts_at),
    chair: value.chair as BarberAppointment["chair"],
  };
}

function mapScheduleEntry(value: Record<string, unknown>): BarberScheduleEntry {
  return {
    id: String(value.id),
    dayOfWeek: Number(value.day_of_week),
    startTime: String(value.start_time).slice(0, 5),
    endTime: String(value.end_time).slice(0, 5),
    isActive: Boolean(value.is_active),
  };
}

export async function getBarberTodayAppointments() {
  const page = await api.get<{ items: Record<string, unknown>[] }>(
    BarberEndpoints.appointmentsToday,
  );
  return { items: page.items.map(mapAppointment) };
}

export async function getBarberWorkspaceProfile(): Promise<BarberWorkspaceProfile> {
  const profile = await api.get<Record<string, unknown>>(
    BarberEndpoints.profile,
  );
  return {
    isWorkstationOnline:
      typeof profile.is_workstation_online === "boolean"
        ? profile.is_workstation_online
        : undefined,
    travelRadiusKm:
      typeof profile.travel_radius_km === "number"
        ? profile.travel_radius_km
        : null,
  };
}

export function getBarberPortfolio() {
  return api.get<Array<{ id: string; url: string; sort_order: number }>>(
    BarberEndpoints.portfolio,
  );
}

export async function getBarberSchedule(): Promise<BarberScheduleEntry[]> {
  const schedule = await api.get<Record<string, unknown>[]>(
    BarberEndpoints.schedule,
  );
  return schedule.map(mapScheduleEntry);
}
