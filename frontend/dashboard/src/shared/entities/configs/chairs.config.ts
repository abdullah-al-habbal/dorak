import { z } from 'zod';
import { isDashboardApiError } from '@/shared/api/dashboard-api-error';
import { dashboardAreas } from '@/shared/auth';
import { publishChairConflict } from '@/shared/components/feedback/chair-conflict-dialog';
import { showWarning } from '@/shared/components/feedback/toast';
import type { Chair } from '@/shared/entities/domain';
import {
  mapChairFromWire,
  mapChairInputToWire,
  type ChairWire,
} from '@/shared/entities/domain/chair-wire';
import { optionalNumber, optionalUuid } from '@/shared/entities/field-coercions';
import { defineEntityConfig } from '@/shared/entities/types/entity-config';

const floorZones = ['men', 'women', 'shared'] as const;
const chairStatuses = ['available', 'occupied', 'maintenance'] as const;

const fields = {
  label: { control: 'text', label: 'common.label', schema: z.string().min(1).max(120) },
  branchId: { control: 'uuid', label: 'common.branchId', schema: z.string().uuid() },
  barberId: { control: 'uuid', label: 'common.barberId', schema: optionalUuid() },
  floorZone: {
    control: 'select',
    label: 'common.floorZone',
    options: [
      { value: 'men', label: 'chairs.floorZoneMen' },
      { value: 'women', label: 'chairs.floorZoneWomen' },
      { value: 'shared', label: 'chairs.floorZoneShared' },
    ],
    schema: z.enum(floorZones),
  },
  status: {
    control: 'select',
    label: 'common.status',
    options: [
      { value: 'available', label: 'chairs.statusAvailable' },
      { value: 'occupied', label: 'chairs.statusOccupied' },
      { value: 'maintenance', label: 'chairs.statusMaintenance' },
    ],
    schema: z.enum(chairStatuses),
  },
  uiMetadata: {
    control: 'group',
    fields: {
      positionX: { control: 'number', label: 'common.positionX', schema: z.coerce.number() },
      positionY: { control: 'number', label: 'common.positionY', schema: z.coerce.number() },
      width: {
        control: 'number',
        label: 'common.width',
        min: 0.01,
        schema: z.coerce.number().positive(),
      },
      height: {
        control: 'number',
        label: 'common.height',
        min: 0.01,
        schema: z.coerce.number().positive(),
      },
      rotation: {
        control: 'number',
        label: 'chairs.rotation',
        schema: optionalNumber(z.coerce.number()),
      },
    },
  },
} as const;

function handleChairMutationError(error: Error): void {
  if (isDashboardApiError(error) && error.status === 409) {
    publishChairConflict();
    showWarning('Chair changes are blocked by active or future bookings.');
  }
}

export const chairsConfig = defineEntityConfig<Chair, typeof fields>({
  slug: 'chairs',
  entity: { singular: 'chair', plural: 'chairs' },
  api: {
    collection: '/dashboard/chairs',
    defaultParams: { page: 1, per_page: 15 },
    methods: { update: 'PUT' },
  },
  access: {
    create: { areas: dashboardAreas },
    edit: { areas: dashboardAreas },
    read: { areas: dashboardAreas },
  },
  messages: {
    singular: 'navigation.chairs',
    plural: 'navigation.chairs',
    description: 'chairs.description',
    empty: 'chairs.empty',
    created: 'chairs.created',
    updated: 'chairs.updated',
    deleted: 'chairs.deleted',
  },
  fields,
  ui: {
    list: {
      search: true,
      columns: [
        { id: 'label', label: 'common.label', value: (chair) => chair.label ?? '—' },
        { id: 'status', label: 'common.status', value: (chair) => chair.status },
        { id: 'floorZone', label: 'common.floorZone', value: (chair) => chair.floorZone },
      ],
    },
    show: {
      title: (chair) => chair.label ?? 'Chair',
      fields: [
        { label: 'common.label', value: (chair) => chair.label ?? '—' },
        { label: 'common.status', value: (chair) => chair.status },
        { label: 'common.floorZone', value: (chair) => chair.floorZone },
        { label: 'common.branchId', value: (chair) => chair.branchId },
        { label: 'common.barberId', value: (chair) => chair.barberId ?? '—' },
      ],
    },
  },
  overrides: {
    fromApi: (response) => mapChairFromWire(response as ChairWire),
    onMutationError: handleChairMutationError,
    toCreatePayload: mapChairInputToWire,
    toUpdatePayload: mapChairInputToWire,
  },
});
