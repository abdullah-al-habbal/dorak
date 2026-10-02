import { z } from 'zod';
import type { Stylist } from '@/shared/entities/domain';
import {
  mapStylistFromWire,
  mapStylistInputToWire,
  type StylistWire,
} from '@/shared/entities/domain/stylist-wire';
import { optionalUuid } from '@/shared/entities/field-coercions';
import { defineEntityConfig } from '@/shared/entities/types/entity-config';

const stylistStatuses = ['pending', 'enabled', 'disabled'] as const;

const fields = {
  name: {
    control: 'group',
    fields: {
      en: { control: 'text', label: 'common.englishName', schema: z.string().min(2).max(120) },
      ar: { control: 'text', label: 'common.arabicName', schema: z.string().min(2).max(120) },
    },
  },
  email: { control: 'email', label: 'common.email', schema: z.string().email().max(255) },
  phone: {
    control: 'text',
    label: 'common.phone',
    schema: z.string().min(7).max(30).nullable().optional(),
  },
  password: {
    control: 'password',
    label: 'common.password',
    schema: z.string().min(12).max(255).optional(),
  },
  chairId: { control: 'uuid', label: 'common.chair', schema: optionalUuid() },
  status: {
    control: 'select',
    label: 'common.status',
    options: [
      { value: 'pending', label: 'stylists.statusPending' },
      { value: 'enabled', label: 'stylists.statusEnabled' },
      { value: 'disabled', label: 'stylists.statusDisabled' },
    ],
    schema: z.enum(stylistStatuses).optional(),
  },
} as const;

const createSchema = z.object({
  name: z.object({
    en: z.string().min(2).max(120),
    ar: z.string().min(2).max(120),
  }),
  email: z.string().email().max(255),
  phone: z.string().min(7).max(30).nullable().optional(),
  password: z.string().min(12).max(255),
  chairId: optionalUuid(),
  status: z.enum(stylistStatuses).optional(),
});

export const stylistsConfig = defineEntityConfig<Stylist, typeof fields>({
  slug: 'stylists',
  entity: { singular: 'stylist', plural: 'stylists' },
  api: {
    collection: '/dashboard/stylists',
    defaultParams: { page: 1, per_page: 15 },
    methods: { update: 'PUT' },
  },
  access: { areas: ['admin', 'manager'] },
  messages: {
    singular: 'navigation.stylists',
    plural: 'navigation.stylists',
    description: 'stylists.description',
    empty: 'stylists.empty',
    created: 'stylists.created',
    updated: 'stylists.updated',
    deleted: 'stylists.deleted',
  },
  fields,
  ui: {
    form: { create: true, edit: true },
    list: {
      search: true,
      columns: [
        { id: 'name', label: 'common.name', value: (stylist) => stylist.name.en },
        { id: 'email', label: 'common.email', value: (stylist) => stylist.email },
        { id: 'status', label: 'common.status', value: (stylist) => stylist.status },
      ],
    },
    show: {
      title: (stylist) => stylist.name.en,
      fields: [
        { label: 'common.englishName', value: (stylist) => stylist.name.en },
        { label: 'common.arabicName', value: (stylist) => stylist.name.ar },
        { label: 'common.email', value: (stylist) => stylist.email },
        { label: 'common.phone', value: (stylist) => stylist.phone ?? '—' },
        { label: 'common.status', value: (stylist) => stylist.status },
      ],
    },
  },
  overrides: {
    fromApi: (response) => mapStylistFromWire(response as StylistWire),
    schema: { create: createSchema },
    toCreatePayload: mapStylistInputToWire,
    toUpdatePayload: mapStylistInputToWire,
  },
});
