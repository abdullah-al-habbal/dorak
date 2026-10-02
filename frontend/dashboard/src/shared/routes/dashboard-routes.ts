import { type DashboardArea } from '@/shared/auth';

export const DASHBOARD_API = {
  bookings: '/dashboard/bookings',
  walkInBookings: '/dashboard/bookings/walk-in',
  overview: '/dashboard/overview',
  branches: '/dashboard/branches',
  chairs: '/dashboard/chairs',
  services: '/dashboard/services',
  stylists: '/dashboard/stylists',
} as const;

type DashboardEntity = 'bookings' | 'branches' | 'chairs' | 'services' | 'stylists';

/**
 * Literal call sites (navigation) keep autocomplete and typo protection, while
 * the entity engine can pass a config's runtime `slug`.
 */
type EntitySlug = DashboardEntity | (string & {});

const base = (area: DashboardArea): `/${DashboardArea}` => `/${area}`;

export const APP_ROUTES = {
  login: '/login',
  dashboard: (area: DashboardArea) => base(area),
  entity: (area: DashboardArea, entity: EntitySlug) => `${base(area)}/${entity}`,
  create: (area: DashboardArea, entity: EntitySlug) => `${base(area)}/${entity}/create`,
  edit: (area: DashboardArea, entity: EntitySlug, id: string) =>
    `${base(area)}/${entity}/${id}/edit`,
  show: (area: DashboardArea, entity: EntitySlug, id: string) => `${base(area)}/${entity}/${id}`,
} as const;

export type { DashboardArea, DashboardEntity };
