import { ChairShowPage } from '@/features/chairs/components/cards/chair-show-page';
export default async function Page({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  return <ChairShowPage area="manager" id={(await params).id} />;
}
