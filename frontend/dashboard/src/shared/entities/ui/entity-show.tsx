'use client';

import Link from 'next/link';
import { CardSkeleton } from '@/shared/components/feedback/skeletons/card-skeleton';
import { GenericShowPage } from '@/shared/components/templates/generic-show-page';
import { createEntityHooks } from '@/shared/entities/entity-hooks';
import type { EntityFieldTree } from '@/shared/entities/fields';
import type { EntityConfig, EntityRecord } from '@/shared/entities/types/entity-config';
import type { EntityId } from '@/shared/entities/types/entity-id';
import { useDashboardTranslation } from '@/shared/hooks/use-dashboard-translation';
import type { DashboardArea } from '@/shared/routes/dashboard-routes';
import type { ServerListParams } from '@/shared/types/query';

type EntityShowProps<TEntity extends EntityRecord, TInput, TFields extends EntityFieldTree> = {
  readonly area: DashboardArea;
  readonly config: EntityConfig<TEntity, TInput, TFields, ServerListParams>;
  readonly id: EntityId;
};

export function EntityShow<TEntity extends EntityRecord, TInput, TFields extends EntityFieldTree>({
  area,
  config,
  id,
}: Readonly<EntityShowProps<TEntity, TInput, TFields>>) {
  const CustomShow = config.overrides?.renderShow;
  return CustomShow === undefined ? (
    <DefaultEntityShow area={area} config={config} id={id} />
  ) : (
    <CustomShow area={area} id={id} />
  );
}

function DefaultEntityShow<TEntity extends EntityRecord, TInput, TFields extends EntityFieldTree>({
  area,
  config,
  id,
}: Readonly<EntityShowProps<TEntity, TInput, TFields>>) {
  const { t } = useDashboardTranslation();
  const hooks = createEntityHooks(config);
  const query = hooks.useEntity(id);
  const entity = query.data;
  if (entity === undefined) {
    return <CardSkeleton />;
  }
  const path = `/${area}/${config.slug}`;
  return (
    <GenericShowPage
      actions={
        config.ui.form?.edit ? (
          <Link
            className="rounded-lg bg-primary px-3 py-2 text-sm text-background"
            href={`${path}/${id}/edit`}
          >
            {t('actions.edit')}
          </Link>
        ) : undefined
      }
      details={config.ui.show.fields.map((field) => ({
        label: t(field.label as never),
        value: field.value(entity),
      }))}
      title={config.ui.show.title(entity)}
    />
  );
}
