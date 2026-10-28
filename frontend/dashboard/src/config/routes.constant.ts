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
    resource: (
      actor: OperationsActor,
      resource: "branches" | "chairs" | "services" | "stylists" | "bookings",
    ) => `/${actor}/${resource}`,
  },
  admin: {
    disputedReviews: "/admin/disputed-reviews",
    exchangeRates: "/admin/exchange-rates",
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
    icon: "home",
    actors: OPERATIONS_ACTORS,
    href: (actor) => ROUTES.operations.overview(actor as OperationsActor),
  },
  {
    key: "branches",
    icon: "home",
    actors: OPERATIONS_ACTORS,
    href: (actor) =>
      ROUTES.operations.resource(actor as OperationsActor, "branches"),
  },
  {
    key: "floorPlan",
    icon: "home",
    actors: OPERATIONS_ACTORS,
    href: (actor) => ROUTES.operations.floorPlan(actor as OperationsActor),
  },
  {
    key: "reviews",
    icon: "home",
    actors: OPERATIONS_ACTORS,
    href: (actor) => ROUTES.operations.reviews(actor as OperationsActor),
  },
  {
    key: "affiliations",
    icon: "home",
    actors: OPERATIONS_ACTORS,
    href: (actor) => ROUTES.operations.affiliations(actor as OperationsActor),
  },
  {
    key: "jobPostings",
    icon: "home",
    actors: OPERATIONS_ACTORS,
    href: (actor) => ROUTES.operations.jobPostings(actor as OperationsActor),
  },
  {
    key: "bookings",
    icon: "home",
    actors: OPERATIONS_ACTORS,
    href: (actor) =>
      ROUTES.operations.resource(actor as OperationsActor, "bookings"),
  },
  {
    key: "services",
    icon: "home",
    actors: OPERATIONS_ACTORS,
    href: (actor) =>
      ROUTES.operations.resource(actor as OperationsActor, "services"),
  },
  {
    key: "chairs",
    icon: "home",
    actors: OPERATIONS_ACTORS,
    href: (actor) =>
      ROUTES.operations.resource(actor as OperationsActor, "chairs"),
  },
  {
    key: "disputedReviews",
    icon: "home",
    actors: ["admin"],
    href: () => ROUTES.admin.disputedReviews,
  },
  {
    key: "exchangeRates",
    icon: "home",
    actors: ["admin"],
    href: () => ROUTES.admin.exchangeRates,
  },
  {
    key: "stylists",
    icon: "home",
    actors: OPERATIONS_ACTORS,
    href: (actor) =>
      ROUTES.operations.resource(actor as OperationsActor, "stylists"),
  },
];
