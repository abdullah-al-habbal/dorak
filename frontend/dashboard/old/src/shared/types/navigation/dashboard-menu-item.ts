import type { LucideIcon } from 'lucide-react';
import type { DashboardArea, DashboardRole } from '@/shared/auth';
import type { NavigationMessageKey } from './navigation-message-key';

export interface DashboardMenuItem {
  icon: LucideIcon;
  label: NavigationMessageKey;
  path: (area: DashboardArea) => string;
  roles?: readonly DashboardRole[];
}
