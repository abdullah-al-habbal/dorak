import {
  Building2,
  CalendarCheck,
  CalendarDays,
  LayoutDashboard,
  Scissors,
  Users,
} from 'lucide-react';
import { APP_ROUTES } from '@/shared/routes/app-routes.const';
import type { DashboardMenuItem } from '@/shared/types/navigation/dashboard-menu-item';

/**
 * A `roles` list is a narrowing that must mirror the entity's `access.read` in
 * its config. It is omitted when `access.read` allows every area, which is the
 * case for all six items today. A branch manager therefore sees Branches:
 * `branches.config.ts` grants `read` to the manager area and Laravel scopes the
 * response to their own branch. Adding `roles` here does not restrict the API;
 * it only keeps the sidebar from linking a route that would `notFound()`.
 */
export const DASHBOARD_MENU_ITEMS: ReadonlyArray<DashboardMenuItem> = [
  { icon: LayoutDashboard, label: 'navigation.overview', path: APP_ROUTES.dashboard },
  {
    icon: Building2,
    label: 'navigation.branches',
    path: (area) => APP_ROUTES.entity(area, 'branches'),
  },
  {
    icon: CalendarCheck,
    label: 'navigation.bookings',
    path: (area) => APP_ROUTES.entity(area, 'bookings'),
  },
  {
    icon: Scissors,
    label: 'navigation.services',
    path: (area) => APP_ROUTES.entity(area, 'services'),
  },
  {
    icon: CalendarDays,
    label: 'navigation.chairs',
    path: (area) => APP_ROUTES.entity(area, 'chairs'),
  },
  {
    icon: Users,
    label: 'navigation.stylists',
    path: (area) => APP_ROUTES.entity(area, 'stylists'),
  },
];
