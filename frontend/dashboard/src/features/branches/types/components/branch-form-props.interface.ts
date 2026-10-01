import type {
  CreateBranchInput,
  UpdateBranchInput,
} from '@/features/branches/schemas/branch.schema';

export interface BranchFormProps {
  defaultValues?: UpdateBranchInput;
  formId: string;
  onSubmit: (input: CreateBranchInput | UpdateBranchInput) => void;
  requiresPassword: boolean;
}
