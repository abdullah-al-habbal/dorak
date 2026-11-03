import type {
  PortalNavigationItem,
  PortalRouteConfig,
} from "@/config/routes.types";
import {
  AUTH_ACTORS,
  OPERATIONS_ACTORS,
} from "@/services/api/auth/actors.constant";
import type {
  AuthActor,
  OperationsActor,
} from "@/services/api/auth/types/auth.types";
import { mapRecord } from "@/utils/record.util";

// Every actor portal shares one path shape and copy-key convention; the actor
// list in `actors.enum.ts` is the only thing to extend. Do not create actor
// maps in pages or layouts.
function portalRoutes<TActor extends AuthActor>(actor: TActor) {
  const root = `/${actor}` as const;
  const profile = `${root}/profile` as const;

  return {
    root,
    login: `${root}/login`,
    profile: {
      root: profile,
      account: `${profile}/account`,
      security: `${profile}/security`,
      notification: `${profile}/notification`,
      settings: `${profile}/settings`,
    },
    copy: {
      publicLabel: actor,
      authTitle: `${actor}Title`,
      portalTitle: `${actor}Title`,
    },
  } as const satisfies PortalRouteConfig;
}

export const PORTAL_CONFIG = mapRecord(AUTH_ACTORS, portalRoutes);

export const ROUTES = {
  home: "/",
  forbidden: "/forbidden",
  portal: PORTAL_CONFIG,
  operations: {
    overview: (actor: OperationsActor) => `/${actor}/overview`,
    floorPlan: (actor: OperationsActor) => `/${actor}/floor-plan`,
    reviews: (actor: OperationsActor) => `/${actor}/reviews`,
    affiliations: (actor: OperationsActor) => `/${actor}/affiliations`,
    jobPostings: (actor: OperationsActor) => `/${actor}/job-postings`,
    brands: (actor: "admin" | "owner") => `/${actor}/brands`,
    resource: (
      actor: OperationsActor,
      resource: "branches" | "chairs" | "services" | "stylists" | "bookings",
    ) => `/${actor}/${resource}`,
    stylistPricing: (actor: "admin" | "owner", stylistId: string) =>
      `/${actor}/stylists/${encodeURIComponent(stylistId)}/pricing`,
  },
  earnings: (actor: "owner" | "manager" | "barber") => `/${actor}/earnings`,
  owner: {
    subscription: "/owner/subscription",
    payouts: "/owner/payouts",
  },
  admin: {
    disputedReviews: "/admin/disputed-reviews",
    exchangeRates: "/admin/exchange-rates",
    catalogItems: "/admin/catalog-items",
    subscriptionPlans: "/admin/subscription-plans",
    subscriptions: "/admin/subscriptions",
    paymentGateways: "/admin/payment-gateways",
    platformSettings: "/admin/settings",
    commissionRules: "/admin/commission-rules",
    payouts: "/admin/payouts",
    analytics: "/admin/analytics",
  },
  api: {
    root: "/api",
    health: "/api/health",
    auth: {
      login: "/api/auth/login",
      logout: "/api/auth/logout",
      refresh: "/api/auth/refresh",
    },
    dashboard: {
      health: "/api/v1/health",
      root: "/api/v1/dashboard",
      login: "/api/v1/dashboard/login",
      logout: "/api/v1/dashboard/logout",
      me: "/api/v1/dashboard/me",
      refresh: "/api/v1/dashboard/refresh",
    },
    barber: {
      root: "/api/v1/barber",
    },
    notifications: {
      root: "/api/v1/notifications",
      inbox: "/api/notifications",
    },
  },
} as const;

export const PORTAL_ACTORS: readonly AuthActor[] = AUTH_ACTORS;

// Portal shells resolve this model against actor and session permissions.
// New portal destinations belong here, never inside a shell component.
export const PORTAL_NAVIGATION: readonly PortalNavigationItem[] = [
  {
    // Operations actors (admin/manager/owner) use "overview" below instead —
    // their portal root now redirects there, so this would be a duplicate.
    key: "dashboard",
    icon: "home",
    actors: ["barber"],
    href: (actor) => ROUTES.portal[actor].root,
  },
  {
    key: "overview",
    icon: "chart",
    actors: OPERATIONS_ACTORS,
    href: (actor) => ROUTES.operations.overview(actor as OperationsActor),
  },
  {
    key: "branches",
    icon: "building",
    actors: OPERATIONS_ACTORS,
    href: (actor) =>
      ROUTES.operations.resource(actor as OperationsActor, "branches"),
  },
  {
    key: "floorPlan",
    icon: "map",
    actors: OPERATIONS_ACTORS,
    href: (actor) => ROUTES.operations.floorPlan(actor as OperationsActor),
  },
  {
    key: "reviews",
    icon: "star",
    actors: OPERATIONS_ACTORS,
    href: (actor) => ROUTES.operations.reviews(actor as OperationsActor),
  },
  {
    key: "affiliations",
    icon: "team",
    actors: OPERATIONS_ACTORS,
    href: (actor) => ROUTES.operations.affiliations(actor as OperationsActor),
  },
  {
    key: "jobPostings",
    icon: "briefcase",
    actors: OPERATIONS_ACTORS,
    href: (actor) => ROUTES.operations.jobPostings(actor as OperationsActor),
  },
  {
    key: "bookings",
    icon: "calendar",
    actors: OPERATIONS_ACTORS,
    href: (actor) =>
      ROUTES.operations.resource(actor as OperationsActor, "bookings"),
  },
  {
    key: "services",
    icon: "layers",
    actors: OPERATIONS_ACTORS,
    href: (actor) =>
      ROUTES.operations.resource(actor as OperationsActor, "services"),
  },
  {
    key: "chairs",
    icon: "layout",
    actors: OPERATIONS_ACTORS,
    href: (actor) =>
      ROUTES.operations.resource(actor as OperationsActor, "chairs"),
  },
  {
    key: "brands",
    icon: "shop",
    actors: ["admin", "owner"],
    href: (actor) => ROUTES.operations.brands(actor as "admin" | "owner"),
  },
  {
    key: "earnings",
    icon: "wallet",
    actors: ["owner", "manager", "barber"],
    href: (actor) => ROUTES.earnings(actor as "owner" | "manager" | "barber"),
  },
  {
    key: "mySubscription",
    icon: "card",
    actors: ["owner"],
    href: () => ROUTES.owner.subscription,
  },
  {
    key: "myPayouts",
    icon: "wallet",
    actors: ["owner"],
    href: () => ROUTES.owner.payouts,
  },
  {
    key: "catalogItems",
    icon: "file",
    actors: ["admin"],
    href: () => ROUTES.admin.catalogItems,
  },
  {
    key: "disputedReviews",
    icon: "message",
    actors: ["admin"],
    href: () => ROUTES.admin.disputedReviews,
  },
  {
    key: "exchangeRates",
    icon: "globe",
    actors: ["admin"],
    href: () => ROUTES.admin.exchangeRates,
  },
  {
    key: "subscriptionPlans",
    icon: "card",
    actors: ["admin"],
    href: () => ROUTES.admin.subscriptionPlans,
  },
  {
    key: "subscriptions",
    icon: "card",
    actors: ["admin"],
    href: () => ROUTES.admin.subscriptions,
  },
  {
    key: "paymentGateways",
    icon: "card",
    actors: ["admin"],
    href: () => ROUTES.admin.paymentGateways,
  },
  {
    key: "commissionRules",
    icon: "sliders",
    actors: ["admin"],
    href: () => ROUTES.admin.commissionRules,
  },
  {
    key: "payouts",
    icon: "wallet",
    actors: ["admin"],
    href: () => ROUTES.admin.payouts,
  },
  {
    key: "platformAnalytics",
    icon: "chart",
    actors: ["admin"],
    href: () => ROUTES.admin.analytics,
  },
  {
    key: "platformSettings",
    icon: "gear",
    actors: ["admin"],
    href: () => ROUTES.admin.platformSettings,
  },
  {
    key: "stylists",
    icon: "user",
    actors: OPERATIONS_ACTORS,
    href: (actor) =>
      ROUTES.operations.resource(actor as OperationsActor, "stylists"),
  },
];
