import { BranchUpdatePage } from '@/features/branches/components/forms/branch-update-page';

export default async function AdminBranchEditPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) { return <BranchUpdatePage basePath="/admin" id={(await params).id} />; }
