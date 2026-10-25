import { api } from "@/services/api/client";
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
    workstationOnline:
      typeof profile.workstation_online === "boolean"
        ? profile.workstation_online
        : undefined,
    travelRadius:
      typeof profile.travel_radius === "number" ? profile.travel_radius : null,
  };
}

export function getBarberPortfolio() {
  return api.get<Array<{ id: string; url: string; sort_order: number }>>(
    BarberEndpoints.portfolio,
  );
}
