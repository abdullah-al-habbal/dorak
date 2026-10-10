import type { DashboardArea } from '@/shared/auth';
import type { DashboardEntity } from './dashboard-entity.type';

const base = (area: DashboardArea): `/${DashboardArea}` => `/${area}`;

export const APP_ROUTES = {
  login: '/login',
  dashboard: (area: DashboardArea) => base(area),
  entity: (area: DashboardArea, entity: DashboardEntity | (string & {})) =>
    `${base(area)}/${entity}`,
  create: (area: DashboardArea, entity: DashboardEntity | (string & {})) =>
    `${base(area)}/${entity}/create`,
  edit: (area: DashboardArea, entity: DashboardEntity | (string & {}), id: string) =>
    `${base(area)}/${entity}/${id}/edit`,
  show: (area: DashboardArea, entity: DashboardEntity | (string & {}), id: string) =>
    `${base(area)}/${entity}/${id}`,
} as const;
