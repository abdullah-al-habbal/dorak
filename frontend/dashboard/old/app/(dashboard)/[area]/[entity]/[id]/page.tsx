import { DynamicEntityShow } from '@/shared/entities/dynamic-entity-client';
import { resolveDynamicEntity } from '@/shared/entities/dynamic-route';

export default async function Page({
  params,
}: Readonly<{ params: Promise<{ area: string; entity: string; id: string }> }>) {
  const { area, entity, id } = await params;
  const resolved = resolveDynamicEntity(area, entity, 'read');
  return <DynamicEntityShow area={resolved.area} entity={entity} id={id} />;
}
