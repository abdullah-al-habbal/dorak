'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { isDashboardApiError } from '@/shared/api/dashboard-api-error';
import { showError, showSuccess } from '@/shared/components/feedback/toast';
import { Input } from '@/shared/components/forms/input';
import { GenericCreatePage } from '@/shared/components/templates/generic-form-page';
import { bookingsConfig } from '@/shared/entities/configs/bookings.config';
import { branchesConfig } from '@/shared/entities/configs/branches.config';
import { chairsConfig } from '@/shared/entities/configs/chairs.config';
import { servicesConfig } from '@/shared/entities/configs/services.config';
import type { WalkInBookingInput } from '@/shared/entities/domain';
import { createEntityApi } from '@/shared/entities/entity-api';
import { createEntityHooks } from '@/shared/entities/entity-hooks';
import { useInvalidatingMutation } from '@/shared/hooks/use-invalidating-mutation';
import { APP_ROUTES, type DashboardArea } from '@/shared/routes/dashboard-routes';

const bookingApi = createEntityApi(bookingsConfig);
const bookingHooks = createEntityHooks(bookingsConfig);
const branchHooks = createEntityHooks(branchesConfig);
const chairHooks = createEntityHooks(chairsConfig);
const serviceHooks = createEntityHooks(servicesConfig);

export function WalkInBookingForm({ area }: Readonly<{ area: DashboardArea; id?: string }>) {
  const router = useRouter();
  const form = useForm<WalkInBookingInput>({
    defaultValues: {
      barberId: undefined,
      branchId: '',
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
  const mutation = useInvalidatingMutation(
    { mutationFn: (input: WalkInBookingInput) => bookingApi.create(input) },
    [bookingHooks.queryKeys.all, ['dashboard', 'chairs'], ['dashboard', 'overview']],
  );
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
      isPending={mutation.isPending}
      submitLabel="Create walk-in booking"
      title="Create walk-in booking"
    >
      <form
        className="grid gap-4 sm:grid-cols-2"
        id="walk-in-booking"
        onSubmit={form.handleSubmit((input) =>
          mutation.mutate(
            { ...input, barberId: selectedChair?.barberId ?? undefined },
            {
              onError: (error) =>
                showError(
                  isDashboardApiError(error) && error.status === 409
                    ? 'This chair is already booked for that time.'
                    : error.message,
                ),
              onSuccess: (booking) => {
                showSuccess('Walk-in booking created.');
                router.push(APP_ROUTES.show(area, 'bookings', booking.id));
              },
            },
          ),
        )}
      >
        <select {...form.register('branchId', { required: true })}>
          <option value="">Select branch</option>
          {branches.data?.items.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name.en}
            </option>
          ))}
        </select>
        <select disabled={branchId === ''} {...form.register('chairId', { required: true })}>
          <option value="">Select chair</option>
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
        <Input placeholder="Customer name" {...form.register('customerName', { required: true })} />
        <Input
          placeholder="Customer email"
          type="email"
          {...form.register('customerEmail', { required: true })}
        />
        <Input placeholder="Customer phone" {...form.register('customerPhone')} />
      </form>
    </GenericCreatePage>
  );
}
