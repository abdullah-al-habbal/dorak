import { StylistEditor } from '@/features/stylists/components/forms/stylist-editor';
export default async function Page({ params }: Readonly<{ params: Promise<{ id: string }> }>) { return <StylistEditor area="admin" id={(await params).id} />; }
