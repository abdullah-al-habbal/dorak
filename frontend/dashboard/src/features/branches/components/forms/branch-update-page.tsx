'use client';

import { useRouter } from 'next/navigation';
import { BranchForm } from '@/features/branches/components/forms/branch-form';
import { useBranch, useUpdateBranch } from '@/features/branches/hooks';
import type { BranchPageProps } from '@/features/branches/types/components';
import { GenericUpdatePage } from '@/shared/components/templates/generic-form-page';
import { APP_ROUTES } from '@/shared/routes/dashboard-routes';

const formId = 'update-branch';

export function BranchUpdatePage({ area, id }: Readonly<BranchPageProps>) {
  const router = useRouter();
  const branch = useBranch(id);
  const mutation = useUpdateBranch();
  const values =
    branch.data === undefined
      ? undefined
      : {
          ...branch.data,
          latitude: branch.data.latitude === null ? undefined : Number(branch.data.latitude),
          longitude: branch.data.longitude === null ? undefined : Number(branch.data.longitude),
        };
  return (
    <GenericUpdatePage
      cancelHref={APP_ROUTES.show(area, 'branches', id)}
      formId={formId}
      isLoading={branch.isLoading}
      isPending={mutation.isPending}
      submitLabel="Save changes"
      title="Update branch"
    >
      <BranchForm
        {...(values === undefined ? {} : { defaultValues: values })}
        formId={formId}
        onSubmit={(input) =>
          mutation.mutate(
            { id, input: input },
            { onSuccess: () => router.push(APP_ROUTES.show(area, 'branches', id)) },
          )
        }
        requiresPassword={false}
      />
    </GenericUpdatePage>
  );
}
