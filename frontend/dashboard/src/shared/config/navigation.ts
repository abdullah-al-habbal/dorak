import {
  Building2,
  CalendarCheck,
  CalendarDays,
  LayoutDashboard,
  Scissors,
  Users,
} from 'lucide-react';
import { APP_ROUTES } from '@/shared/routes/dashboard-routes';
import type { DashboardMenuItem } from '@/shared/types/navigation/dashboard-menu-item';

export const DASHBOARD_MENU_ITEMS: ReadonlyArray<DashboardMenuItem> = [
  { icon: LayoutDashboard, label: 'navigation.overview', path: APP_ROUTES.dashboard },
  {
    icon: Building2,
    label: 'navigation.branches',
    path: (area) => APP_ROUTES.entity(area, 'branches'),
    platformOnly: true,
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
