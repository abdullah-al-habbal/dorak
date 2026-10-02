export const DASHBOARD_API = {
  bookings: '/dashboard/bookings',
  walkInBookings: '/dashboard/bookings/walk-in',
  overview: '/dashboard/overview',
  branches: '/dashboard/branches',
  chairs: '/dashboard/chairs',
  services: '/dashboard/services',
  stylists: '/dashboard/stylists',
} as const;

type DashboardArea = 'admin' | 'manager';
type DashboardEntity = 'bookings' | 'branches' | 'chairs' | 'services' | 'stylists';

const base = (area: DashboardArea): `/${DashboardArea}` => `/${area}`;

export const APP_ROUTES = {
  login: '/login',
  dashboard: (area: DashboardArea) => base(area),
  entity: (area: DashboardArea, entity: DashboardEntity) => `${base(area)}/${entity}`,
  create: (area: DashboardArea, entity: DashboardEntity) => `${base(area)}/${entity}/create`,
  edit: (area: DashboardArea, entity: DashboardEntity, id: string) =>
    `${base(area)}/${entity}/${id}/edit`,
  show: (area: DashboardArea, entity: DashboardEntity, id: string) =>
    `${base(area)}/${entity}/${id}`,
} as const;

export type { DashboardArea, DashboardEntity };
