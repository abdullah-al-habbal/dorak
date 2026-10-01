import { ServiceShowPage } from '@/features/services/components/cards/service-show-page';
export default async function Page({ params }: Readonly<{ params: Promise<{ id: string }> }>) { return <ServiceShowPage area="admin" id={(await params).id} />; }
