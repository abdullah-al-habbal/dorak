import { resolveDynamicEntity } from '@/shared/entities/dynamic-route';
import { EntityForm } from '@/shared/entities/ui';

export default async function Page({
  params,
}: Readonly<{ params: Promise<{ area: string; entity: string }> }>) {
  const { area, entity } = await params;
  const resolved = resolveDynamicEntity(area, entity);
  return <EntityForm area={resolved.area} config={resolved.config} />;
}
