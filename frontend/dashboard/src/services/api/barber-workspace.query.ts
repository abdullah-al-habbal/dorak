import { apiRequest } from "@/services/api/client";
import { BarberEndpoints } from "@/services/api/barber-workspace/endpoints/barber-workspace.endpoints";
import type {
  BarberAppointment,
  BarberWorkspaceProfile,
} from "@/services/api/barber-workspace.types";

function mapAppointment(value: Record<string, unknown>): BarberAppointment {
  return {
    id: String(value.id),
    status: String(value.status),
    timeSlot: String(value.time_slot),
    chair: value.chair as BarberAppointment["chair"],
  };
}

export async function getBarberTodayAppointments() {
  const page = await apiRequest<{ items: Record<string, unknown>[] }>(
    BarberEndpoints.appointmentsToday,
    { auth: "session" },
  );
  return { items: page.items.map(mapAppointment) };
}

export async function getBarberWorkspaceProfile(): Promise<BarberWorkspaceProfile> {
  const profile = await apiRequest<Record<string, unknown>>(
    BarberEndpoints.profile,
    { auth: "session" },
  );
  return {
    workstationOnline:
      typeof profile.workstation_online === "boolean"
        ? profile.workstation_online
        : undefined,
    travelRadius:
      typeof profile.travel_radius === "number" ? profile.travel_radius : null,
  };
}

export function getBarberSchedule() {
  return apiRequest<unknown>(BarberEndpoints.schedule, { auth: "session" });
}

export function getBarberPortfolio() {
  return apiRequest<Array<{ id: string; url: string; sort_order: number }>>(
    BarberEndpoints.portfolio,
    { auth: "session" },
  );
}
