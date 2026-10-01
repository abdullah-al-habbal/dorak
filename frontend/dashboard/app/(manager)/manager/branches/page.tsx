import { BranchList } from '@/features/branches/components/tables/branch-list';

export default function ManagerBranchesPage() {
  return <BranchList area="manager" canCreate={false} />;
}
