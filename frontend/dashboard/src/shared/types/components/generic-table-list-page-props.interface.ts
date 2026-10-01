import type { ReactNode } from 'react';
import type { PaginationState } from '@/shared/types/components/pagination-state.interface';

export interface GenericTableListPageProps {
  actions?: ReactNode;
  children: ReactNode;
  description: string;
  emptyMessage: string;
  filters?: ReactNode;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onSearchChange: (value: string) => void;
  pagination?: PaginationState;
  search: string;
  title: string;
}
