import type { LucideIcon } from 'lucide-react';
import type { DashboardArea } from '@/shared/routes/dashboard-routes';
import type { NavigationMessageKey } from './navigation-message-key';

export interface DashboardMenuItem {
  icon: LucideIcon;
  label: NavigationMessageKey;
  path: (area: DashboardArea) => string;
  platformOnly?: boolean;
}
