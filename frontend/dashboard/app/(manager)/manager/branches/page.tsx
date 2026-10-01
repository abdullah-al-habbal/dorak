import { BranchList } from '@/features/branches/components/tables/branch-list';

export default function ManagerBranchesPage() { return <BranchList basePath="/manager" canCreate={false} />; }
