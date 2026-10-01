'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { isDashboardApiError } from '@/shared/api/dashboard-api-error';
import { showError, showSuccess } from '@/shared/components/feedback/toast';
import { Input } from '@/shared/components/forms/input';
import { GenericCreatePage } from '@/shared/components/templates/generic-form-page';
import { useCreateWalkInBooking } from '@/features/bookings/hooks';
import type { WalkInBookingInput } from '@/features/bookings/types/booking';
import { useBranches } from '@/features/branches/hooks';
import { useChairs } from '@/features/chairs/hooks';
import { useServices } from '@/features/services/hooks';
import { APP_ROUTES } from '@/shared/routes/dashboard-routes';
import type { WalkInBookingCreatePageProps } from '@/features/bookings/types/components';

const formId = 'walk-in-booking';

export function WalkInBookingCreatePage({ area }: Readonly<WalkInBookingCreatePageProps>) {
  const router = useRouter();
  const form = useForm<WalkInBookingInput>({ defaultValues: { customer_email: '', customer_name: '', customer_phone: '', service_ids: [] } });
  const branchId = form.watch('branch_id');
  const chairId = form.watch('chair_id');
  const branches = useBranches({ page: 1, per_page: 100 });
  const chairs = useChairs({ page: 1, per_page: 100 });
  const services = useServices({ page: 1, per_page: 100 });
  const mutation = useCreateWalkInBooking();
  const selectedBranch = branches.data?.items.find((branch) => branch.id === branchId);
  const selectedChair = chairs.data?.items.find((chair) => chair.id === chairId);
  const branchChairs = chairs.data?.items.filter((chair) => chair.branch_id === branchId) ?? [];
  const branchServices = services.data?.items.filter((service) => service.serviceable_id === branchId || (service.serviceable_type === 'brand' && service.serviceable_id === selectedBranch?.brand_id)) ?? [];

  const submit = (input: WalkInBookingInput) => mutation.mutate({ ...input, barber_id: selectedChair?.barber_id ?? undefined, time_slot: new Date(input.time_slot).toISOString() }, { onError: (error) => { const message = isDashboardApiError(error) && error.status === 409 ? 'This chair is already booked for that time. Choose a different time slot.' : error instanceof Error ? error.message : 'Could not create the walk-in booking.'; showError(message); }, onSuccess: (booking) => { showSuccess('Walk-in booking created.'); router.push(APP_ROUTES.show(area, 'bookings', booking.id)); } });

  return <GenericCreatePage cancelHref={APP_ROUTES.entity(area, 'bookings')} formId={formId} isPending={mutation.isPending} submitLabel="Create walk-in booking" title="Create walk-in booking"><form className="grid gap-4 sm:grid-cols-2" id={formId} onSubmit={form.handleSubmit(submit)}><label className="grid gap-1 text-sm">Branch<select className="rounded-lg border bg-surface p-2" {...form.register('branch_id', { required: true })}><option value="">Select branch</option>{branches.data?.items.map((branch) => <option key={branch.id} value={branch.id}>{branch.name.en}</option>)}</select></label><label className="grid gap-1 text-sm">Chair / stylist<select className="rounded-lg border bg-surface p-2" disabled={branchId === undefined || branchId === ''} {...form.register('chair_id', { required: true })}><option value="">Select chair</option>{branchChairs.map((chair) => <option key={chair.id} value={chair.id}>{chair.label ?? chair.id}</option>)}</select></label><label className="grid gap-1 text-sm sm:col-span-2">Services<div className="grid gap-2 sm:grid-cols-2">{branchServices.map((service) => <label className="flex items-center gap-2 rounded-lg border p-3" key={service.id}><input type="checkbox" value={service.id} {...form.register('service_ids', { required: true })} />{service.name.en} · {service.duration ?? 0} min</label>)}</div></label><label className="grid gap-1 text-sm">Appointment time<Input min={toDateTimeLocal(new Date())} type="datetime-local" {...form.register('time_slot', { required: true })} /></label><div className="hidden sm:block" /><Input placeholder="Customer name" {...form.register('customer_name', { required: true })} /><Input placeholder="Customer email" type="email" {...form.register('customer_email', { required: true })} /><Input placeholder="Customer phone (optional)" {...form.register('customer_phone')} /><p className="self-center text-sm">The selected chair&apos;s assigned stylist will be included automatically.</p></form></GenericCreatePage>;
}

function toDateTimeLocal(date: Date): string { const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000); return offsetDate.toISOString().slice(0, 16); }
