import type { CreateBranchInput, UpdateBranchInput } from '@/features/branches/schemas/branch.schema';
import type { DashboardArea } from '@/shared/routes/dashboard-routes';

export interface BranchListProps {
  area: DashboardArea;
  canCreate: boolean;
}

export interface BranchPageProps {
  area: DashboardArea;
  id: string;
}

export interface BranchFormProps {
  defaultValues?: UpdateBranchInput;
  formId: string;
  onSubmit: (input: CreateBranchInput | UpdateBranchInput) => void;
  requiresPassword: boolean;
}
