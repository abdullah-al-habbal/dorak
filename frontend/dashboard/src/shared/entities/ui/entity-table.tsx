'use client';

import Link from 'next/link';
import { GenericTableListPage } from '@/shared/components/templates/generic-table-list-page';
import { createEntityHooks } from '@/shared/entities/entity-hooks';
import type { EntityFieldTree } from '@/shared/entities/fields';
import type { EntityConfig, EntityRecord } from '@/shared/entities/types/entity-config';
import { useDashboardTranslation } from '@/shared/hooks/use-dashboard-translation';
import { useServerQueryParams } from '@/shared/hooks/use-server-query-params';
import type { DashboardArea } from '@/shared/routes/dashboard-routes';
import type { ServerListParams } from '@/shared/types/query';

type EntityTableProps<TEntity extends EntityRecord, TInput, TFields extends EntityFieldTree> = {
  readonly area: DashboardArea;
  readonly config: EntityConfig<TEntity, TInput, TFields, ServerListParams>;
};

export function EntityTable<TEntity extends EntityRecord, TInput, TFields extends EntityFieldTree>({
  area,
  config,
}: Readonly<EntityTableProps<TEntity, TInput, TFields>>) {
  const CustomList = config.overrides?.renderList;
  return CustomList === undefined ? (
    <DefaultEntityTable area={area} config={config} />
  ) : (
    <CustomList area={area} />
  );
}

function DefaultEntityTable<TEntity extends EntityRecord, TInput, TFields extends EntityFieldTree>({
  area,
  config,
}: Readonly<EntityTableProps<TEntity, TInput, TFields>>) {
  const { t } = useDashboardTranslation();
  const params = useServerQueryParams();
  const hooks = createEntityHooks(config);
  const query = hooks.useEntities(params);
  const page = query.data;
  const path = `/${area}/${config.slug}`;

  return (
    <GenericTableListPage
      actions={
        config.ui.form?.create ? (
          <Link
            className="rounded-lg bg-primary px-3 py-2 text-sm text-background"
            href={`${path}/create`}
          >
            {t('actions.create')}
          </Link>
        ) : undefined
      }
      description={t(config.messages.description as never)}
      emptyMessage={t(config.messages.empty as never)}
      filters={config.ui.list.filters?.map((filter) => (
        <label className="grid gap-1 text-sm" key={filter.key}>
          <span>{t(filter.label as never)}</span>
          <select
            className="rounded-lg border bg-surface px-3 py-2"
            onChange={(event) => params.setValue(filter.key, event.target.value)}
          >
            <option value="">{t('bookings.all')}</option>
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {t(option.label as never)}
              </option>
            ))}
          </select>
        </label>
      ))}
      isEmpty={page?.items.length === 0}
      isLoading={query.isLoading}
      onPageChange={params.setPage}
      onSearchChange={params.setSearch}
      pagination={
        page === undefined
          ? undefined
          : { currentPage: page.pagination.currentPage, totalPages: page.pagination.totalPages }
      }
      search={params.search ?? ''}
      title={t(config.messages.plural as never)}
    >
      <div className="rounded-lg border bg-surface">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b">
              {config.ui.list.columns.map((column) => (
                <th className="p-3 font-medium" key={column.id}>
                  {t(column.label as never)}
                </th>
              ))}
              <th className="p-3 font-medium">{t('actions.view')}</th>
            </tr>
          </thead>
          <tbody>
            {page?.items.map((entity) => (
              <tr className="border-b" key={entity.id}>
                {config.ui.list.columns.map((column) => (
                  <td className="p-3" key={column.id}>
                    {column.value(entity)}
                  </td>
                ))}
                <td className="p-3">
                  <Link className="underline" href={`${path}/${entity.id}`}>
                    {t('actions.view')}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GenericTableListPage>
  );
}
