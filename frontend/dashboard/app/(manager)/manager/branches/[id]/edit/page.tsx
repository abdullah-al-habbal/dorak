import { BranchUpdatePage } from '@/features/branches/components/forms/branch-update-page';

export default async function ManagerBranchEditPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) { return <BranchUpdatePage basePath="/manager" id={(await params).id} />; }
