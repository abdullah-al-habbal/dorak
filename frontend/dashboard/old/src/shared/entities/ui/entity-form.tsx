'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { type FieldValues, useForm } from 'react-hook-form';
import { showSuccess } from '@/shared/components/feedback/toast';
import {
  GenericCreatePage,
  GenericUpdatePage,
} from '@/shared/components/templates/generic-form-page';
import { createEntityHooks } from '@/shared/entities/entity-hooks';
import { buildEntitySchema } from '@/shared/entities/field-schema';
import type { EntityFieldTree } from '@/shared/entities/fields';
import type { EntityFormProps } from '@/shared/entities/types/entity-form-props';
import type { EntityRecord } from '@/shared/entities/types/entity-record';
import { useDashboardTranslation } from '@/shared/hooks/use-dashboard-translation';
import { APP_ROUTES } from '@/shared/routes/app-routes.const';
import { EntityFields } from './entity-fields';
import { useResetEntityForm } from './use-reset-entity-form';

export function EntityForm<TEntity extends EntityRecord, TInput, TFields extends EntityFieldTree>({
  area,
  claim,
  config,
  id,
}: Readonly<EntityFormProps<TEntity, TInput, TFields>>) {
  const CustomForm = config.overrides?.renderForm;
  return CustomForm === undefined ? (
    <DefaultEntityForm area={area} config={config} {...(id === undefined ? {} : { id })} />
  ) : (
    <CustomForm area={area} claim={claim} {...(id === undefined ? {} : { id })} />
  );
}

/** The default form needs no actor identity: Laravel scopes the session. */
function DefaultEntityForm<TEntity extends EntityRecord, TInput, TFields extends EntityFieldTree>({
  area,
  config,
  id,
}: Readonly<Omit<EntityFormProps<TEntity, TInput, TFields>, 'claim'>>) {
  const router = useRouter();
  const { t } = useDashboardTranslation();
  const editing = id !== undefined;
  const schema =
    (editing ? config.overrides?.schema?.update : config.overrides?.schema?.create) ??
    buildEntitySchema(config.fields);
  const form = useForm<FieldValues>({ resolver: zodResolver(schema as never) as never });
  const hooks = createEntityHooks(config);
  const existing = hooks.useEntity(id ?? '');
  const create = hooks.useCreateEntity();
  const update = hooks.useUpdateEntity();
  const path = APP_ROUTES.entity(area, config.slug);

  useResetEntityForm(existing.data as never, form.reset);

  const submit = (values: FieldValues) => {
    if (id === undefined) {
      create.mutate(values as TInput, {
        onSuccess: (entity) => {
          showSuccess(t(config.messages.created));
          router.push(APP_ROUTES.show(area, config.slug, entity.id));
        },
      });
      return;
    }
    update.mutate(
      { id, input: values as TInput },
      {
        onSuccess: () => {
          showSuccess(t(config.messages.updated));
          router.push(APP_ROUTES.show(area, config.slug, id));
        },
      },
    );
  };
  const Template = editing ? GenericUpdatePage : GenericCreatePage;

  return (
    <Template
      cancelHref={editing ? APP_ROUTES.show(area, config.slug, id) : path}
      formId={`${config.slug}-editor`}
      isLoading={editing && existing.isLoading}
      isPending={create.isPending || update.isPending}
      submitLabel={editing ? t('actions.saveChanges') : t('actions.create')}
      title={editing ? t('actions.edit') : t('actions.create')}
    >
      <form
        className="grid gap-4 sm:grid-cols-2"
        id={`${config.slug}-editor`}
        onSubmit={form.handleSubmit(submit)}
      >
        <EntityFields
          control={form.control}
          fields={config.fields}
          formState={form.formState}
          register={(name) => form.register(name)}
          renderField={config.overrides?.renderField}
        />
      </form>
    </Template>
  );
}
