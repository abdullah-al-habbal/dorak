import type { DashboardPage } from '@/shared/types/pagination';

export interface LocalizedName {
  ar: string;
  en: string;
}

export interface Branch {
  brand_id: string;
  email: string;
  id: string;
  latitude: string | null;
  longitude: string | null;
  name: LocalizedName;
  status: 'pending' | 'enabled' | 'disabled';
}

export type BranchPage = DashboardPage<Branch>;
