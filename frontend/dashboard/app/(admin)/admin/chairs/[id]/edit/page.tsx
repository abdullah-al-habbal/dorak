import { ChairEditor } from '@/features/chairs/components/forms/chair-editor';
export default async function Page({ params }: Readonly<{ params: Promise<{ id: string }> }>) { return <ChairEditor area="admin" id={(await params).id} />; }
