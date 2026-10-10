import { z } from 'zod';
import { adminArea, managerArea } from '@/shared/auth';
import type { Booking, BookingStatus, WalkInBookingInput } from '@/shared/entities/domain';
import {
  mapBookingFromWire,
  mapBookingInputToWire,
  type BookingWire,
} from '@/shared/entities/domain/booking-wire';
import type { BookingUpdatePayloadWire } from '@/shared/entities/domain/wire/booking-update-payload-wire';
import { optionalUuid } from '@/shared/entities/field-coercions';
import { defineEntityConfig } from '@/shared/entities/types/entity-config';
import type { ServerListParams } from '@/shared/types/query/server-list-params-wire';

/**
 * Create takes the full walk-in field set; update only ever carries a status
 * transition. Modelling both keeps `toCreatePayload` and `toUpdatePayload`
 * typed instead of forcing one of them to widen.
 */
export type BookingCreateInput = WalkInBookingInput;

export type BookingStatusUpdateInput = {
  readonly status: BookingStatus;
};

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

export const bookingsConfig = defineEntityConfig<
  Booking,
  typeof fields,
  BookingListParams,
  BookingCreateInput | BookingStatusUpdateInput
>({
  slug: 'bookings',
  entity: { singular: 'booking', plural: 'bookings' },
  api: {
    collection: '/dashboard/bookings',
  },
  access: {
    create: { areas: [adminArea, managerArea] },
    read: { areas: [adminArea, managerArea] },
  },
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
      filters: [
        {
          key: 'chair_id',
          label: 'common.chair',
          param: 'chairId',
        },
        {
          key: 'stylist_id',
          label: 'common.stylist',
          param: 'stylistId',
        },
      ],
    },
    show: {
      fields: [
        { label: 'common.status', value: (booking) => booking.status },
        { label: 'bookings.start', value: (booking) => booking.timeSlot },
        { label: 'bookings.end', value: (booking) => booking.endsAt ?? '—' },
        { label: 'common.chair', value: (booking) => booking.chair?.label ?? '—' },
        { label: 'common.stylist', value: (booking) => booking.barber?.name.en ?? '—' },
        {
          label: 'common.services',
          value: (booking) => booking.services.map((service) => service.name.en).join(', '),
        },
      ],
    },
  },
  overrides: {
    endpoint: { create: () => '/dashboard/bookings/walk-in' },
    fromApi: (response) => mapBookingFromWire(response as BookingWire),
    toCreatePayload: (input) => mapBookingInputToWire(input as WalkInBookingInput),
    /**
     * Create and update carry different payloads, so a status transition gets
     * its own mapper instead of the walk-in one.
     */
    toUpdatePayload: (input): BookingUpdatePayloadWire => ({
      status: (input as BookingStatusUpdateInput).status,
    }),
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
