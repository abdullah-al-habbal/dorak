import { z } from 'zod';
import type { Service } from '@/shared/entities/domain';
import {
  mapServiceFromWire,
  mapServiceInputToWire,
  type ServiceWire,
} from '@/shared/entities/domain/service-wire';
import { serviceableTypeValues } from '@/shared/entities/domain/serviceable-type';
import { optionalNumber, optionalUuid } from '@/shared/entities/field-coercions';
import { defineEntityConfig } from '@/shared/entities/types/entity-config';

const fields = {
  name: {
    control: 'group',
    fields: {
      en: { control: 'text', label: 'common.englishName', schema: z.string().min(2).max(120) },
      ar: { control: 'text', label: 'common.arabicName', schema: z.string().min(2).max(120) },
    },
  },
  price: {
    control: 'number',
    label: 'common.price',
    min: 0,
    schema: z.coerce.number().nonnegative(),
  },
  duration: {
    control: 'number',
    label: 'common.duration',
    min: 1,
    max: 1_440,
    schema: optionalNumber(z.coerce.number().int().min(1).max(1_440)),
  },
  currencyId: { control: 'uuid', label: 'common.currencyId', schema: z.string().uuid() },
  active: { control: 'switch', label: 'common.active', schema: z.boolean().default(true) },
  serviceableId: { control: 'uuid', label: 'common.branchId', schema: z.string().uuid() },
  serviceableType: {
    control: 'select',
    label: 'common.ownerType',
    options: [
      { value: 'branch', label: 'common.branch' },
      { value: 'brand', label: 'common.brand' },
      { value: 'barber', label: 'common.stylist' },
    ],
    schema: z.enum(serviceableTypeValues),
  },
  catalogItemId: {
    control: 'uuid',
    label: 'common.catalogItemId',
    schema: optionalUuid(),
  },
} as const;

export const servicesConfig = defineEntityConfig<Service, typeof fields>({
  slug: 'services',
  entity: { singular: 'service', plural: 'services' },
  api: {
    collection: '/dashboard/services',
    defaultParams: { page: 1, per_page: 15 },
    methods: { update: 'PUT' },
  },
  access: { areas: ['admin', 'manager'] },
  messages: {
    singular: 'navigation.services',
    plural: 'navigation.services',
    description: 'services.description',
    empty: 'services.empty',
    created: 'services.created',
    updated: 'services.updated',
    deleted: 'services.deleted',
  },
  fields,
  ui: {
    form: { create: true, edit: true },
    list: {
      search: true,
      columns: [
        {
          id: 'name',
          label: 'common.name',
          serverSortKey: 'name',
          value: (service) => service.name.en,
        },
        {
          id: 'price',
          label: 'common.price',
          serverSortKey: 'price',
          value: (service) => service.price,
        },
        { id: 'duration', label: 'common.duration', value: (service) => service.duration ?? '—' },
        { id: 'active', label: 'common.active', value: (service) => String(service.active) },
      ],
    },
    show: {
      title: (service) => service.name.en,
      fields: [
        { label: 'common.englishName', value: (service) => service.name.en },
        { label: 'common.arabicName', value: (service) => service.name.ar },
        { label: 'common.price', value: (service) => service.price },
        { label: 'common.duration', value: (service) => service.duration ?? '—' },
        { label: 'common.active', value: (service) => String(service.active) },
        { label: 'common.ownerType', value: (service) => service.serviceableType },
      ],
    },
  },
  overrides: {
    fromApi: (response) => mapServiceFromWire(response as ServiceWire),
    toCreatePayload: mapServiceInputToWire,
    toUpdatePayload: mapServiceInputToWire,
  },
});
