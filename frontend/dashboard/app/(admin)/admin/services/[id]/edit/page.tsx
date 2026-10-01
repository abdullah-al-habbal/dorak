import { ServiceEditor } from '@/features/services/components/forms/service-editor';
export default async function Page({ params }: Readonly<{ params: Promise<{ id: string }> }>) { return <ServiceEditor area="admin" id={(await params).id} />; }
