const BASE = "/dashboard";

export const DashboardEndpoints = {
  overview: `${BASE}/overview`,
  profile: `${BASE}/profile`,
  profileNotifications: `${BASE}/profile/notifications`,
  profilePassword: `${BASE}/profile/password`,
  profileEmailChange: `${BASE}/profile/email/change`,
  profileEmailVerify: `${BASE}/profile/email/verify`,
  settings: `${BASE}/settings`,
  bookingsWalkIn: `${BASE}/bookings/walk-in`,
  resource: (resource: string) => `${BASE}/${resource}`,
  resourceById: (resource: string, id: string) =>
    `${BASE}/${resource}/${encodeURIComponent(id)}`,
  resourceAction: (resource: string, id: string, action: string) =>
    `${BASE}/${resource}/${encodeURIComponent(id)}/${action}`,
  branchFloorPlan: (id: string) =>
    `${BASE}/branches/${encodeURIComponent(id)}/floor-plan`,
  branchReviews: (id: string) =>
    `${BASE}/branches/${encodeURIComponent(id)}/reviews`,
  bookingCancel: (id: string) =>
    `${BASE}/bookings/${encodeURIComponent(id)}/cancel`,
  bookingReschedule: (id: string) =>
    `${BASE}/bookings/${encodeURIComponent(id)}/reschedule`,
  bookingReview: (id: string) =>
    `${BASE}/bookings/${encodeURIComponent(id)}/review`,
} as const;
