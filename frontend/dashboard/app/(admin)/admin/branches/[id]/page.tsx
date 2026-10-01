import { BranchShowPage } from '@/features/branches/components/cards/branch-show-page';

export default async function AdminBranchPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) { return <BranchShowPage basePath="/admin" id={(await params).id} />; }
