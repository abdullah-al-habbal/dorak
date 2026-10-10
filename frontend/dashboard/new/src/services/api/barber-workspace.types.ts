export interface BarberAppointment {
  id: string;
  status: string;
  timeSlot: string;
  chair?: { label?: string | null } | null;
}

export interface BarberWorkspaceProfile {
  workstationOnline?: boolean;
  travelRadius?: number | null;
  portfolio?: Array<{ id: string; url?: string; path?: string }>;
}
