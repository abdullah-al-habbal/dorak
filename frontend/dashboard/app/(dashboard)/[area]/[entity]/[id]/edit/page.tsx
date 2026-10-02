import { resolveDynamicEntity } from '@/shared/entities/dynamic-route';
import { EntityForm } from '@/shared/entities/ui';

export default async function Page({
  params,
}: Readonly<{ params: Promise<{ area: string; entity: string; id: string }> }>) {
  const { area, entity, id } = await params;
  const resolved = resolveDynamicEntity(area, entity, 'edit');
  return <EntityForm area={resolved.area} config={resolved.config} id={id} />;
}
