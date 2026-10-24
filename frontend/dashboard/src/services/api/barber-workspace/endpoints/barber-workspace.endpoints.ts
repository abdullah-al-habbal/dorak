export const BarberEndpoints = {
  workstationStatus: "/api/barber/workstation-status",
  appointmentsToday: "/api/barber/appointments/today",
  profile: "/api/barber/profile",
  schedule: "/api/barber/schedule",
  portfolio: "/api/barber/portfolio",
  bookingTransition: (id: string, transition: string) =>
    `/api/barber/bookings/${encodeURIComponent(id)}/${transition}`,
  bookingCancel: (id: string) =>
    `/api/barber/bookings/${encodeURIComponent(id)}/cancel`,
} as const;
