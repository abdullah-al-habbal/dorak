import { notFound } from 'next/navigation';
import { resolveRequestClaim } from '@/shared/auth/resolve-request-claim';
import { resolveDynamicEntity } from '@/shared/entities/dynamic-route';
import { EntityForm } from '@/shared/entities/ui';

export default async function Page({
  params,
}: Readonly<{ params: Promise<{ area: string; entity: string; id: string }> }>) {
  const { area, entity, id } = await params;
  const resolved = resolveDynamicEntity(area, entity, 'edit');
  const claim = await resolveRequestClaim();
  if (claim === null) {
    notFound();
  }

  return <EntityForm area={resolved.area} claim={claim} config={resolved.config} id={id} />;
}
