'use client';

import type { DashboardClaim } from '@/shared/auth';
import { EntityForm, EntityShow, EntityTable } from '@/shared/entities/ui';
import { resolveDynamicEntity } from './dynamic-route';

type DynamicEntityProps = {
  readonly area: string;
  readonly entity: string;
};

/**
 * Entity configurations contain mappers and renderers, which are executable
 * values. Resolve them inside the client boundary instead of serializing them
 * from an App Router server page to the generic entity widgets.
 */
export function DynamicEntityTable({ area, entity }: Readonly<DynamicEntityProps>) {
  const resolved = resolveDynamicEntity(area, entity, 'read');
  return <EntityTable area={resolved.area} config={resolved.config} />;
}

export function DynamicEntityShow({
  area,
  entity,
  id,
}: Readonly<DynamicEntityProps & { readonly id: string }>) {
  const resolved = resolveDynamicEntity(area, entity, 'read');
  return <EntityShow area={resolved.area} config={resolved.config} id={id} />;
}

export function DynamicEntityForm({
  area,
  claim,
  entity,
  id,
}: Readonly<DynamicEntityProps & { readonly claim: DashboardClaim; readonly id?: string }>) {
  const resolved = resolveDynamicEntity(area, entity, id === undefined ? 'create' : 'edit');
  return (
    <EntityForm
      area={resolved.area}
      claim={claim}
      config={resolved.config}
      {...(id === undefined ? {} : { id })}
    />
  );
}
