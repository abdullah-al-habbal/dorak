import type { LucideIcon } from 'lucide-react';
import type { DashboardMessageKey } from '@/shared/i18n/messages';
import type { DashboardArea } from '@/shared/routes/dashboard-routes';
import type { DashboardRole } from '@/shared/types/auth';

export type NavigationMessageKey = Extract<DashboardMessageKey, `navigation.${string}`>;

export interface DashboardMenuItem {
  icon: LucideIcon;
  label: NavigationMessageKey;
  path: (area: DashboardArea) => string;
  platformOnly?: boolean;
}

export interface SidebarProps {
  className?: string;
  role: DashboardRole;
}
