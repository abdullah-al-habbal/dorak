import { DynamicEntityTable } from '@/shared/entities/dynamic-entity-client';
import { resolveDynamicEntity } from '@/shared/entities/dynamic-route';

export default async function Page({
  params,
}: Readonly<{ params: Promise<{ area: string; entity: string }> }>) {
  const { area, entity } = await params;
  const resolved = resolveDynamicEntity(area, entity, 'read');

  return <DynamicEntityTable area={resolved.area} entity={entity} />;
}
