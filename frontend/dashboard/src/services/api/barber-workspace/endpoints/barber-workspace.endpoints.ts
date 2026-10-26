const BASE = "/barber";

export const BarberEndpoints = {
  workstationStatus: `${BASE}/workstation-status`,
  appointmentsToday: `${BASE}/appointments/today`,
  profile: `${BASE}/profile`,
  schedule: `${BASE}/schedule`,
  portfolio: `${BASE}/portfolio`,
  travelRadius: `${BASE}/travel-radius`,
  portfolioPhoto: (id: string) => `${BASE}/portfolio/${encodeURIComponent(id)}`,
  bookingTransition: (id: string, transition: string) =>
    `${BASE}/bookings/${encodeURIComponent(id)}/${transition}`,
  bookingCancel: (id: string) =>
    `${BASE}/bookings/${encodeURIComponent(id)}/cancel`,
} as const;
