'use client';

import { Search } from 'lucide-react';
import { Button } from '@/shared/components/buttons/button';
import { Skeleton } from '@/shared/components/feedback/skeleton';
import { Input } from '@/shared/components/forms/input';
import { Breadcrumbs } from '@/shared/components/layout/breadcrumbs';

export interface PaginationState {
  currentPage: number;
  totalPages: number;
}

interface GenericTableListPageProps {
  actions?: React.ReactNode;
  children: React.ReactNode;
  description: string;
  emptyMessage: string;
  filters?: React.ReactNode;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onSearchChange: (value: string) => void;
  pagination?: PaginationState;
  search: string;
  title: string;
}

export function GenericTableListPage({ actions, children, description, emptyMessage, filters, isLoading, onPageChange, onSearchChange, pagination, search, title }: Readonly<GenericTableListPageProps>) {
  return <section className="space-y-6"><Breadcrumbs /><header className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-2xl font-semibold">{title}</h1><p className="mt-1 text-sm text-foreground">{description}</p></div>{actions}</header><div className="flex flex-wrap gap-3"><label className="relative"><span className="sr-only">Search</span><Search className="absolute start-3 top-3 text-foreground" size={16} /><Input className="ps-9" onChange={(event) => onSearchChange(event.target.value)} placeholder="Search" value={search} /></label>{filters}</div>{isLoading ? <Skeleton className="h-64 w-full" /> : children}{!isLoading && pagination === undefined ? <p className="rounded-lg border p-6 text-center text-sm">{emptyMessage}</p> : null}{pagination ? <div className="flex items-center justify-end gap-3"><Button disabled={pagination.currentPage <= 1} onClick={() => onPageChange(pagination.currentPage - 1)} type="button" variant="outline">Previous</Button><span className="text-sm">{pagination.currentPage} / {pagination.totalPages}</span><Button disabled={pagination.currentPage >= pagination.totalPages} onClick={() => onPageChange(pagination.currentPage + 1)} type="button" variant="outline">Next</Button></div> : null}</section>;
}
