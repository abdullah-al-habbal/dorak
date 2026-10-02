import { z } from 'zod';
import type { Booking } from '@/shared/entities/domain';
import {
  mapBookingFromWire,
  mapBookingInputToWire,
  type BookingWire,
} from '@/shared/entities/domain/booking-wire';
import { optionalUuid } from '@/shared/entities/field-coercions';
import { defineEntityConfig } from '@/shared/entities/types/entity-config';
import type { ServerListParams } from '@/shared/types/query';

export type BookingListParams = ServerListParams & {
  readonly chairId?: string | undefined;
  readonly dateFrom?: string | undefined;
  readonly dateTo?: string | undefined;
  readonly status?: string | undefined;
  readonly stylistId?: string | undefined;
};

const fields = {
  branchId: { control: 'uuid', label: 'common.branchId', schema: z.string().uuid() },
  chairId: { control: 'uuid', label: 'common.chair', schema: z.string().uuid() },
  barberId: { control: 'uuid', label: 'common.barberId', schema: optionalUuid() },
  customerName: {
    control: 'text',
    label: 'bookings.customerName',
    schema: z.string().min(1).max(120),
  },
  customerEmail: {
    control: 'email',
    label: 'bookings.customerEmail',
    schema: z.string().email().max(255),
  },
  customerPhone: {
    control: 'text',
    label: 'bookings.customerPhone',
    schema: z.string().max(30).optional(),
  },
  serviceIds: {
    control: 'text',
    label: 'common.services',
    schema: z.array(z.string().uuid()).min(1),
  },
  timeSlot: { control: 'text', label: 'bookings.appointmentTime', schema: z.string().min(1) },
} as const;

export const bookingsConfig = defineEntityConfig<Booking, typeof fields, BookingListParams>({
  slug: 'bookings',
  entity: { singular: 'booking', plural: 'bookings' },
  api: {
    collection: '/dashboard/bookings',
    defaultParams: { page: 1, per_page: 15 },
  },
  access: { areas: ['admin', 'manager'] },
  messages: {
    singular: 'navigation.bookings',
    plural: 'navigation.bookings',
    description: 'bookings.manage',
    empty: 'bookings.noBookings',
    created: 'bookings.created',
    updated: 'bookings.updated',
    deleted: 'bookings.cancelled',
  },
  fields,
  ui: {
    form: { create: true },
    list: {
      search: true,
      columns: [
        { id: 'timeSlot', label: 'bookings.appointmentTime', value: (booking) => booking.timeSlot },
        { id: 'status', label: 'common.status', value: (booking) => booking.status },
        { id: 'chair', label: 'common.chair', value: (booking) => booking.chair?.label ?? '—' },
        {
          id: 'stylist',
          label: 'common.stylist',
          value: (booking) => booking.barber?.name.en ?? '—',
        },
      ],
    },
    show: {
      title: () => 'Booking',
      fields: [
        { label: 'common.status', value: (booking) => booking.status },
        { label: 'bookings.start', value: (booking) => booking.timeSlot },
        { label: 'bookings.end', value: (booking) => booking.endsAt ?? '—' },
        { label: 'common.chair', value: (booking) => booking.chair?.label ?? '—' },
        { label: 'common.stylist', value: (booking) => booking.barber?.name.en ?? '—' },
      ],
    },
  },
  overrides: {
    endpoint: { create: () => '/dashboard/bookings/walk-in' },
    fromApi: (response) => mapBookingFromWire(response as BookingWire),
    toCreatePayload: mapBookingInputToWire,
    toListParams: (params) => ({
      chair_id: params.chairId,
      date_from: params.dateFrom,
      date_to: params.dateTo,
      page: params.page,
      per_page: params.per_page,
      status: params.status,
      stylist_id: params.stylistId,
    }),
  },
});
