import { BranchShowPage } from '@/features/branches/components/cards/branch-show-page';

export default async function ManagerBranchPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) { return <BranchShowPage area="manager" id={(await params).id} />; }
