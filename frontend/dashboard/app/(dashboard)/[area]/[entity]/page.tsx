import { resolveDynamicEntity } from '@/shared/entities/dynamic-route';
import { EntityTable } from '@/shared/entities/ui';

export default async function Page({
  params,
}: Readonly<{ params: Promise<{ area: string; entity: string }> }>) {
  const { area, entity } = await params;
  const resolved = resolveDynamicEntity(area, entity);

  return <EntityTable area={resolved.area} config={resolved.config} />;
}
