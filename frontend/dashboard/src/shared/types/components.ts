import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { DashboardRole } from '@/shared/types/auth';

export type ButtonVariant = 'default' | 'ghost' | 'outline';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export interface DashboardShellProps {
  children: ReactNode;
  role: DashboardRole;
}

export interface NavbarProps {
  onOpenMenu: () => void;
}

export interface DetailItem {
  label: string;
  value: ReactNode;
}

export interface GenericShowPageProps {
  actions?: ReactNode;
  details: DetailItem[];
  title: string;
}

export interface PaginationState {
  currentPage: number;
  totalPages: number;
}

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

export interface GenericFormPageProps {
  cancelHref: string;
  children: ReactNode;
  isLoading?: boolean;
  isPending: boolean;
  formId: string;
  submitLabel: string;
  title: string;
}
