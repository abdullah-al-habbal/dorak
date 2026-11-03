import { DASHBOARD_API_BASE_PATH } from "@/services/api/dashboard/endpoints/dashboard.endpoints.constant";
export const DashboardEndpoints = {
  overview: `${DASHBOARD_API_BASE_PATH}/overview`,
  earnings: `${DASHBOARD_API_BASE_PATH}/earnings`,
  ownerSubscription: `${DASHBOARD_API_BASE_PATH}/subscription`,
  ownerPayouts: `${DASHBOARD_API_BASE_PATH}/payouts`,
  profile: `${DASHBOARD_API_BASE_PATH}/profile`,
  profileNotifications: `${DASHBOARD_API_BASE_PATH}/profile/notifications`,
  profilePassword: `${DASHBOARD_API_BASE_PATH}/profile/password`,
  profileEmailChange: `${DASHBOARD_API_BASE_PATH}/profile/email/change`,
  profileEmailVerify: `${DASHBOARD_API_BASE_PATH}/profile/email/verify`,
  settings: `${DASHBOARD_API_BASE_PATH}/settings`,
  bookingsWalkIn: `${DASHBOARD_API_BASE_PATH}/bookings/walk-in`,
  resource: (resource: string) => `${DASHBOARD_API_BASE_PATH}/${resource}`,
  resourceById: (resource: string, id: string) =>
    `${DASHBOARD_API_BASE_PATH}/${resource}/${encodeURIComponent(id)}`,
  resourceAction: (resource: string, id: string, action: string) =>
    `${DASHBOARD_API_BASE_PATH}/${resource}/${encodeURIComponent(id)}/${action}`,
  branchFloorPlan: (id: string) =>
    `${DASHBOARD_API_BASE_PATH}/branches/${encodeURIComponent(id)}/floor-plan`,
  branchReviews: (id: string) =>
    `${DASHBOARD_API_BASE_PATH}/branches/${encodeURIComponent(id)}/reviews`,
  branchAffiliations: (id: string) =>
    `${DASHBOARD_API_BASE_PATH}/branches/${encodeURIComponent(id)}/affiliations`,
  branchAffiliationAction: (
    id: string,
    affiliationId: string,
    action: "accept" | "reject" | "terminate",
  ) =>
    `${DASHBOARD_API_BASE_PATH}/branches/${encodeURIComponent(id)}/affiliations/${encodeURIComponent(affiliationId)}/${action}`,
  branchJobPostings: (id: string) =>
    `${DASHBOARD_API_BASE_PATH}/branches/${encodeURIComponent(id)}/job-postings`,
  branchJobPosting: (id: string, postingId: string) =>
    `${DASHBOARD_API_BASE_PATH}/branches/${encodeURIComponent(id)}/job-postings/${encodeURIComponent(postingId)}`,
  branchApplications: (id: string, postingId: string) =>
    `${DASHBOARD_API_BASE_PATH}/branches/${encodeURIComponent(id)}/job-postings/${encodeURIComponent(postingId)}/applications`,
  branchApplicationStatus: (
    id: string,
    postingId: string,
    applicationId: string,
  ) =>
    `${DASHBOARD_API_BASE_PATH}/branches/${encodeURIComponent(id)}/job-postings/${encodeURIComponent(postingId)}/applications/${encodeURIComponent(applicationId)}/status`,
  adminReviews: `${DASHBOARD_API_BASE_PATH}/admin/reviews`,
  adminReviewResolve: (id: string) =>
    `${DASHBOARD_API_BASE_PATH}/admin/reviews/${encodeURIComponent(id)}/resolve`,
  adminPlans: `${DASHBOARD_API_BASE_PATH}/admin/subscription-plans`,
  adminPlan: (id: string) =>
    `${DASHBOARD_API_BASE_PATH}/admin/subscription-plans/${encodeURIComponent(id)}`,
  adminPlanFeatureKeys: `${DASHBOARD_API_BASE_PATH}/admin/plan-feature-keys`,
  adminSubscriptions: `${DASHBOARD_API_BASE_PATH}/admin/subscriptions`,
  adminSubscriptionStatus: (id: string) =>
    `${DASHBOARD_API_BASE_PATH}/admin/subscriptions/${encodeURIComponent(id)}/status`,
  adminSettings: `${DASHBOARD_API_BASE_PATH}/admin/settings`,
  adminGateways: `${DASHBOARD_API_BASE_PATH}/admin/payment-gateways`,
  adminGateway: (id: string) =>
    `${DASHBOARD_API_BASE_PATH}/admin/payment-gateways/${encodeURIComponent(id)}`,
  adminGatewayActive: (id: string) =>
    `${DASHBOARD_API_BASE_PATH}/admin/payment-gateways/${encodeURIComponent(id)}/active`,
  adminCommissionRules: `${DASHBOARD_API_BASE_PATH}/admin/commission-rules`,
  adminCommissionRule: (id: string) =>
    `${DASHBOARD_API_BASE_PATH}/admin/commission-rules/${encodeURIComponent(id)}`,
  adminCommissionEntries: `${DASHBOARD_API_BASE_PATH}/admin/commission-entries`,
  adminPayouts: `${DASHBOARD_API_BASE_PATH}/admin/payouts`,
  adminPayoutsGenerate: `${DASHBOARD_API_BASE_PATH}/admin/payouts/generate`,
  adminPayoutAction: (id: string, action: string) =>
    `${DASHBOARD_API_BASE_PATH}/admin/payouts/${encodeURIComponent(id)}/${action}`,
  adminAnalytics: `${DASHBOARD_API_BASE_PATH}/admin/analytics/overview`,
  catalogItems: `${DASHBOARD_API_BASE_PATH}/admin/catalog-items`,
  catalogItem: (id: string) =>
    `${DASHBOARD_API_BASE_PATH}/admin/catalog-items/${encodeURIComponent(id)}`,
  catalogCategories: `${DASHBOARD_API_BASE_PATH}/admin/catalog-categories`,
  catalogTags: `${DASHBOARD_API_BASE_PATH}/admin/catalog-tags`,
  adminExchangeRates: `${DASHBOARD_API_BASE_PATH}/admin/exchange-rates`,
  bookingCancel: (id: string) =>
    `${DASHBOARD_API_BASE_PATH}/bookings/${encodeURIComponent(id)}/cancel`,
  bookingReschedule: (id: string) =>
    `${DASHBOARD_API_BASE_PATH}/bookings/${encodeURIComponent(id)}/reschedule`,
  bookingReview: (id: string) =>
    `${DASHBOARD_API_BASE_PATH}/bookings/${encodeURIComponent(id)}/review`,
} as const;
