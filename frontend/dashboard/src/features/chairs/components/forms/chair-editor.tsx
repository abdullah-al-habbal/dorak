'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useChair, useCreateChair, useUpdateChair } from '@/features/chairs/hooks';
import { chairSchema, type ChairInput } from '@/features/chairs/schemas/chair.schema';
import { Input } from '@/shared/components/forms/input';
import {
  GenericCreatePage,
  GenericUpdatePage,
} from '@/shared/components/templates/generic-form-page';
import { APP_ROUTES, type DashboardArea } from '@/shared/routes/dashboard-routes';
const formId = 'chair-editor';
export function ChairEditor({ area, id }: Readonly<{ area: DashboardArea; id?: string }>) {
  const router = useRouter();
  const existing = useChair(id ?? '');
  const create = useCreateChair();
  const update = useUpdateChair();
  const form = useForm<ChairInput>({
    defaultValues: existing.data as never,
    resolver: zodResolver(chairSchema) as never,
  });
  const pending = create.isPending || update.isPending;
  const submit = (input: ChairInput) => {
    if (id === undefined) {
      create.mutate(input, {
        onSuccess: (item) => router.push(APP_ROUTES.show(area, 'chairs', item.id)),
      });
    } else {
      update.mutate(
        { id, input },
        { onSuccess: () => router.push(APP_ROUTES.show(area, 'chairs', id)) },
      );
    }
  };
  const Template = id === undefined ? GenericCreatePage : GenericUpdatePage;
  return (
    <Template
      cancelHref={
        id === undefined ? APP_ROUTES.entity(area, 'chairs') : APP_ROUTES.show(area, 'chairs', id)
      }
      formId={formId}
      isLoading={id !== undefined && existing.isLoading}
      isPending={pending}
      submitLabel={id === undefined ? 'Create chair' : 'Save changes'}
      title={id === undefined ? 'Create chair' : 'Edit chair'}
    >
      <form
        className="grid gap-4 sm:grid-cols-2"
        id={formId}
        onSubmit={form.handleSubmit((input) => submit(input))}
      >
        <Input placeholder="Chair label" {...form.register('label')} />
        <Input placeholder="Branch ID" {...form.register('branch_id')} />
        <Input placeholder="Barber ID" {...form.register('barber_id')} />
        <Input placeholder="Floor zone" {...form.register('floor_zone')} />
        <Input placeholder="Status" {...form.register('status')} />
        <Input
          placeholder="Position X"
          type="number"
          {...form.register('ui_metadata.position_x', { valueAsNumber: true })}
        />
        <Input
          placeholder="Position Y"
          type="number"
          {...form.register('ui_metadata.position_y', { valueAsNumber: true })}
        />
        <Input
          placeholder="Width"
          type="number"
          {...form.register('ui_metadata.width', { valueAsNumber: true })}
        />
        <Input
          placeholder="Height"
          type="number"
          {...form.register('ui_metadata.height', { valueAsNumber: true })}
        />
      </form>
    </Template>
  );
}
