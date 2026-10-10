import { notFound } from 'next/navigation';
import { resolveRequestClaim } from '@/shared/auth/resolve-request-claim';
import { DynamicEntityForm } from '@/shared/entities/dynamic-entity-client';
import { resolveDynamicEntity } from '@/shared/entities/dynamic-route';

export default async function Page({
  params,
}: Readonly<{ params: Promise<{ area: string; entity: string; id: string }> }>) {
  const { area, entity, id } = await params;
  const resolved = resolveDynamicEntity(area, entity, 'edit');
  const claim = await resolveRequestClaim();
  if (claim === null) {
    notFound();
  }

  return <DynamicEntityForm area={resolved.area} claim={claim} entity={entity} id={id} />;
}
