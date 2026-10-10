'use client';

import { Search } from 'lucide-react';
import { Button } from '@/shared/components/buttons/button';
import { EmptyState } from '@/shared/components/feedback/empty-state';
import { TableSkeleton } from '@/shared/components/feedback/skeletons/table-skeleton';
import { Input } from '@/shared/components/forms/input';
import { Breadcrumbs } from '@/shared/components/layout/breadcrumbs';
import { useDashboardTranslation } from '@/shared/hooks/use-dashboard-translation';
import type { GenericTableListPageProps } from '@/shared/types/components';

export type { PaginationState } from '@/shared/types/components';

export function GenericTableListPage({
  actions,
  children,
  description,
  emptyMessage,
  filters,
  isEmpty,
  isLoading,
  onPageChange,
  onSearchChange,
  pagination,
  search,
  title,
}: Readonly<GenericTableListPageProps>) {
  const { t } = useDashboardTranslation();
  return (
    <section className="space-y-6">
      <Breadcrumbs />
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="mt-1 text-sm text-foreground">{description}</p>
        </div>
        {actions}
      </header>
      <div className="flex flex-wrap gap-3">
        {onSearchChange === undefined ? null : (
          <label className="relative">
            <span className="sr-only">{t('common.search')}</span>
            <Search className="absolute start-3 top-3 text-foreground" size={16} />
            <Input
              className="ps-9"
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={t('common.search')}
              value={search ?? ''}
            />
          </label>
        )}
        {filters}
      </div>
      {isLoading ? (
        <TableSkeleton />
      ) : isEmpty ? (
        <EmptyState description={emptyMessage} title={t('common.noRecords')} />
      ) : (
        children
      )}
      {pagination ? (
        <div className="flex items-center justify-end gap-3">
          <Button
            disabled={pagination.currentPage <= 1}
            onClick={() => onPageChange(pagination.currentPage - 1)}
            type="button"
            variant="outline"
          >
            {t('actions.previous')}
          </Button>
          <span className="text-sm">
            {pagination.currentPage} / {pagination.totalPages}
          </span>
          <Button
            disabled={pagination.currentPage >= pagination.totalPages}
            onClick={() => onPageChange(pagination.currentPage + 1)}
            type="button"
            variant="outline"
          >
            {t('actions.next')}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
