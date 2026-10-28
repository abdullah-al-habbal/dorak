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
  branchAffiliations: (id: string) =>
    `${BASE}/branches/${encodeURIComponent(id)}/affiliations`,
  branchAffiliationAction: (
    id: string,
    affiliationId: string,
    action: "accept" | "reject" | "terminate",
  ) =>
    `${BASE}/branches/${encodeURIComponent(id)}/affiliations/${encodeURIComponent(affiliationId)}/${action}`,
  branchJobPostings: (id: string) =>
    `${BASE}/branches/${encodeURIComponent(id)}/job-postings`,
  branchJobPosting: (id: string, postingId: string) =>
    `${BASE}/branches/${encodeURIComponent(id)}/job-postings/${encodeURIComponent(postingId)}`,
  branchApplications: (id: string, postingId: string) =>
    `${BASE}/branches/${encodeURIComponent(id)}/job-postings/${encodeURIComponent(postingId)}/applications`,
  branchApplicationStatus: (
    id: string,
    postingId: string,
    applicationId: string,
  ) =>
    `${BASE}/branches/${encodeURIComponent(id)}/job-postings/${encodeURIComponent(postingId)}/applications/${encodeURIComponent(applicationId)}/status`,
  adminReviews: `${BASE}/admin/reviews`,
  adminReviewResolve: (id: string) =>
    `${BASE}/admin/reviews/${encodeURIComponent(id)}/resolve`,
  adminExchangeRates: `${BASE}/admin/exchange-rates`,
  bookingCancel: (id: string) =>
    `${BASE}/bookings/${encodeURIComponent(id)}/cancel`,
  bookingReschedule: (id: string) =>
    `${BASE}/bookings/${encodeURIComponent(id)}/reschedule`,
  bookingReview: (id: string) =>
    `${BASE}/bookings/${encodeURIComponent(id)}/review`,
} as const;
