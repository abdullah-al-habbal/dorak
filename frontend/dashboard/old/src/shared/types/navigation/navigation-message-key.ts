import type { DashboardMessageKey } from '@/shared/i18n/messages';

export type NavigationMessageKey = Extract<DashboardMessageKey, `navigation.${string}`>;
