'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { isDashboardApiError } from '@/shared/api/dashboard-api-error';
import type { DashboardArea, DashboardClaim } from '@/shared/auth';
import { showError, showSuccess } from '@/shared/components/feedback/toast';
import { Input } from '@/shared/components/forms/input';
import { GenericCreatePage } from '@/shared/components/templates/generic-form-page';
import { bookingsConfig } from '@/shared/entities/configs/bookings.config';
import { branchesConfig } from '@/shared/entities/configs/branches.config';
import { chairsConfig } from '@/shared/entities/configs/chairs.config';
import { servicesConfig } from '@/shared/entities/configs/services.config';
import type { WalkInBookingInput } from '@/shared/entities/domain';
import { createEntityHooks } from '@/shared/entities/entity-hooks';
import { useDashboardTranslation } from '@/shared/hooks/use-dashboard-translation';
import { APP_ROUTES } from '@/shared/routes/app-routes.const';

const bookingHooks = createEntityHooks(bookingsConfig);
const branchHooks = createEntityHooks(branchesConfig);
const chairHooks = createEntityHooks(chairsConfig);
const serviceHooks = createEntityHooks(servicesConfig);

export function WalkInBookingForm({
  area,
  claim,
}: Readonly<{ area: DashboardArea; claim: DashboardClaim; id?: string }>) {
  const router = useRouter();
  const { t } = useDashboardTranslation();
  /**
   * A branch manager is bound to the branch in their claim; a platform admin has
   * no branch and picks freely. `verifyDashboardClaim` guarantees the branch id
   * is present for the former, so the manual selector is never reachable.
   */
  const scopedBranchId = claim.branchId;
  const form = useForm<WalkInBookingInput>({
    defaultValues: {
      barberId: undefined,
      branchId: scopedBranchId ?? '',
      chairId: '',
      customerEmail: '',
      customerName: '',
      customerPhone: undefined,
      serviceIds: [],
      timeSlot: '',
    },
  });
  const branchId = form.watch('branchId');
  const chairId = form.watch('chairId');
  const branches = branchHooks.useEntities({ page: 1, per_page: 100 });
  const chairs = chairHooks.useEntities({ page: 1, per_page: 100 });
  const services = serviceHooks.useEntities({ page: 1, per_page: 100 });
  /**
   * `useCreateEntity` applies `overrides.onMutationError` and invalidates the
   * entity's own keys, which is what the walk-in endpoint needs too.
   */
  const create = bookingHooks.useCreateEntity();
  const selectedBranch = branches.data?.items.find((branch) => branch.id === branchId);
  const selectedChair = chairs.data?.items.find((chair) => chair.id === chairId);
  const branchChairs = chairs.data?.items.filter((chair) => chair.branchId === branchId) ?? [];
  const branchServices =
    services.data?.items.filter(
      (service) =>
        service.serviceableId === branchId ||
        (service.serviceableType === 'brand' && service.serviceableId === selectedBranch?.brandId),
    ) ?? [];
  return (
    <GenericCreatePage
      cancelHref={APP_ROUTES.entity(area, 'bookings')}
      formId="walk-in-booking"
      isPending={create.isPending}
      submitLabel={t('bookings.createWalkIn')}
      title={t('bookings.createWalkIn')}
    >
      <form
        className="grid gap-4 sm:grid-cols-2"
        id="walk-in-booking"
        onSubmit={form.handleSubmit((input) =>
          create.mutate(
            { ...input, barberId: selectedChair?.barberId ?? undefined },
            {
              onError: (error) =>
                showError(
                  isDashboardApiError(error) && error.status === 409
                    ? t('bookings.conflict')
                    : error.message,
                ),
              onSuccess: (booking) => {
                showSuccess(t('bookings.created'));
                router.push(APP_ROUTES.show(area, 'bookings', booking.id));
              },
            },
          ),
        )}
      >
        {scopedBranchId === undefined ? (
          <select {...form.register('branchId', { required: true })}>
            <option value="">{t('bookings.selectBranch')}</option>
            {branches.data?.items.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name.en}
              </option>
            ))}
          </select>
        ) : (
          <div className="grid gap-1">
            <input type="hidden" {...form.register('branchId', { required: true })} />
            <p className="text-muted-foreground text-sm">{selectedBranch?.name.en ?? '—'}</p>
          </div>
        )}
        <select disabled={branchId === ''} {...form.register('chairId', { required: true })}>
          <option value="">{t('bookings.selectChair')}</option>
          {branchChairs.map((chair) => (
            <option key={chair.id} value={chair.id}>
              {chair.label ?? chair.id}
            </option>
          ))}
        </select>
        <div className="sm:col-span-2">
          {branchServices.map((service) => (
            <label className="mr-3" key={service.id}>
              <input
                type="checkbox"
                value={service.id}
                {...form.register('serviceIds', { required: true })}
              />
              {service.name.en}
            </label>
          ))}
        </div>
        <Input type="datetime-local" {...form.register('timeSlot', { required: true })} />
        <Input
          placeholder={t('bookings.customerName')}
          {...form.register('customerName', { required: true })}
        />
        <Input
          placeholder={t('bookings.customerEmail')}
          type="email"
          {...form.register('customerEmail', { required: true })}
        />
        <Input placeholder={t('bookings.customerPhone')} {...form.register('customerPhone')} />
      </form>
    </GenericCreatePage>
  );
}
