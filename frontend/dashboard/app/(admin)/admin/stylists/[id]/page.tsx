import { StylistShowPage } from '@/features/stylists/components/cards/stylist-show-page';
export default async function Page({ params }: Readonly<{ params: Promise<{ id: string }> }>) { return <StylistShowPage area="admin" id={(await params).id} />; }
