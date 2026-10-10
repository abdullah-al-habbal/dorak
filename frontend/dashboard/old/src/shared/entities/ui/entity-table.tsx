'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { DashboardArea } from '@/shared/auth';
import { GenericTableListPage } from '@/shared/components/templates/generic-table-list-page';
import { canPerformOperation } from '@/shared/entities/entity-access';
import { createEntityHooks } from '@/shared/entities/entity-hooks';
import type { EntityFieldTree } from '@/shared/entities/fields';
import type { EntityConfig } from '@/shared/entities/types/entity-config';
import type { EntityFilter } from '@/shared/entities/types/entity-filter';
import type { EntityRecord } from '@/shared/entities/types/entity-record';
import { useDashboardTranslation } from '@/shared/hooks/use-dashboard-translation';
import { useServerQueryParams } from '@/shared/hooks/use-server-query-params';
import { APP_ROUTES } from '@/shared/routes/app-routes.const';
import type { ServerListParams } from '@/shared/types/query/server-list-params-wire';

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
  const searchParams = useSearchParams();
  const hooks = createEntityHooks(config);
  const filters = config.ui.list.filters ?? [];

  /**
   * A filter declares both the URL key and the list field it feeds, so the
   * query is rebuilt from the URL alone instead of each list re-reading and
   * re-mapping `useSearchParams` by hand.
   */
  const filterParams = Object.fromEntries(
    filters.map((filter) => [filter.param, searchParams.get(filter.key) ?? undefined]),
  );
  const query = hooks.useEntities({ ...params, ...filterParams });
  const page = query.data;
  const RowActions = config.ui.list.rowActions;

  return (
    <GenericTableListPage
      actions={
        canPerformOperation(config.access, 'create', area) ? (
          <Link
            className="rounded-lg bg-primary px-3 py-2 text-sm text-background"
            href={APP_ROUTES.create(area, config.slug)}
          >
            {t('actions.create')}
          </Link>
        ) : undefined
      }
      description={t(config.messages.description)}
      emptyMessage={t(config.messages.empty)}
      filters={
        filters.length === 0 ? undefined : (
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <EntityFilterControl
                filter={filter}
                key={filter.key}
                onChange={(value) => params.setValue(filter.key, value)}
                value={searchParams.get(filter.key) ?? ''}
              />
            ))}
          </div>
        )
      }
      isEmpty={page?.items.length === 0}
      isLoading={query.isLoading}
      onPageChange={params.setPage}
      onSearchChange={config.ui.list.search === false ? undefined : params.setSearch}
      pagination={
        page === undefined
          ? undefined
          : { currentPage: page.pagination.currentPage, totalPages: page.pagination.totalPages }
      }
      search={config.ui.list.search === false ? undefined : (params.search ?? '')}
      title={t(config.messages.plural)}
    >
      <div className="rounded-lg border bg-surface">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b">
              {config.ui.list.columns.map((column) => (
                <th className="p-3 font-medium" key={column.id}>
                  {t(column.label)}
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
                  <Link className="underline" href={APP_ROUTES.show(area, config.slug, entity.id)}>
                    {t('actions.view')}
                  </Link>
                  {RowActions === undefined ? null : (
                    <span className="ml-2">
                      <RowActions area={area} entity={entity} />
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GenericTableListPage>
  );
}

function EntityFilterControl({
  filter,
  onChange,
  value,
}: Readonly<{
  filter: EntityFilter;
  onChange: (value: string) => void;
  value: string;
}>) {
  const { t } = useDashboardTranslation();
  const RenderOptions = filter.renderOptions;
  return (
    <label className="grid gap-1 text-sm">
      <span>{t(filter.label)}</span>
      {RenderOptions === undefined ? (
        <select
          className="rounded-lg border bg-surface px-3 py-2"
          onChange={(event) => onChange(event.target.value)}
          value={value}
        >
          <option value="">{t('common.all')}</option>
          {filter.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <RenderOptions onChange={onChange} value={value} />
      )}
    </label>
  );
}
