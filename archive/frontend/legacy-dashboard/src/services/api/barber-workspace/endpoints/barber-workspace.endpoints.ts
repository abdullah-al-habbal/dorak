import { BARBER_WORKSPACE_API_BASE_PATH } from "@/services/api/barber-workspace/endpoints/barber-workspace.endpoints.constant";
export const BarberEndpoints = {
  workstationStatus: `${BARBER_WORKSPACE_API_BASE_PATH}/workstation-status`,
  appointmentsToday: `${BARBER_WORKSPACE_API_BASE_PATH}/appointments/today`,
  profile: `${BARBER_WORKSPACE_API_BASE_PATH}/profile`,
  schedule: `${BARBER_WORKSPACE_API_BASE_PATH}/schedule`,
  portfolio: `${BARBER_WORKSPACE_API_BASE_PATH}/portfolio`,
  travelRadius: `${BARBER_WORKSPACE_API_BASE_PATH}/travel-radius`,
  portfolioPhoto: (id: string) =>
    `${BARBER_WORKSPACE_API_BASE_PATH}/portfolio/${encodeURIComponent(id)}`,
  bookingTransition: (id: string, transition: string) =>
    `${BARBER_WORKSPACE_API_BASE_PATH}/bookings/${encodeURIComponent(id)}/${transition}`,
  bookingCancel: (id: string) =>
    `${BARBER_WORKSPACE_API_BASE_PATH}/bookings/${encodeURIComponent(id)}/cancel`,
} as const;
