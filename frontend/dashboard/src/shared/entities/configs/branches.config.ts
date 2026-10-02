import { z } from 'zod';
import type { Branch } from '@/shared/entities/domain';
import {
  mapBranchFromWire,
  mapBranchInputToWire,
  type BranchWire,
} from '@/shared/entities/domain/branch-wire';
import { optionalNumber } from '@/shared/entities/field-coercions';
import { defineEntityConfig } from '@/shared/entities/types/entity-config';

const branchStatuses = ['pending', 'enabled', 'disabled'] as const;

const fields = {
  name: {
    control: 'group',
    fields: {
      en: { control: 'text', label: 'common.englishName', schema: z.string().min(2).max(120) },
      ar: { control: 'text', label: 'common.arabicName', schema: z.string().min(2).max(120) },
    },
  },
  brandId: { control: 'uuid', label: 'common.brandId', schema: z.string().uuid() },
  email: { control: 'email', label: 'common.email', schema: z.string().email().max(255) },
  password: {
    control: 'password',
    label: 'common.password',
    schema: z.string().min(12).max(255).optional(),
  },
  latitude: {
    control: 'number',
    label: 'common.latitude',
    min: -90,
    max: 90,
    schema: optionalNumber(z.coerce.number().min(-90).max(90)),
  },
  longitude: {
    control: 'number',
    label: 'common.longitude',
    min: -180,
    max: 180,
    schema: optionalNumber(z.coerce.number().min(-180).max(180)),
  },
  status: {
    control: 'select',
    label: 'common.status',
    options: [
      { value: 'pending', label: 'branches.statusPending' },
      { value: 'enabled', label: 'branches.statusEnabled' },
      { value: 'disabled', label: 'branches.statusDisabled' },
    ],
    schema: z.enum(branchStatuses).optional(),
  },
} as const;

const createSchema = z.object({
  name: z.object({
    en: z.string().min(2).max(120),
    ar: z.string().min(2).max(120),
  }),
  brandId: z.string().uuid(),
  email: z.string().email().max(255),
  password: z.string().min(12).max(255),
  latitude: optionalNumber(z.coerce.number().min(-90).max(90)),
  longitude: optionalNumber(z.coerce.number().min(-180).max(180)),
  status: z.enum(branchStatuses).optional(),
});

export const branchesConfig = defineEntityConfig<Branch, typeof fields>({
  slug: 'branches',
  entity: { singular: 'branch', plural: 'branches' },
  api: {
    collection: '/dashboard/branches',
    defaultParams: { page: 1, per_page: 15 },
    methods: { update: 'PUT' },
  },
  access: { areas: ['admin', 'manager'] },
  messages: {
    singular: 'navigation.branches',
    plural: 'navigation.branches',
    description: 'branches.description',
    empty: 'branches.empty',
    created: 'branches.created',
    updated: 'branches.updated',
    deleted: 'branches.deleted',
  },
  fields,
  ui: {
    form: { create: true, edit: true },
    list: {
      search: true,
      columns: [
        { id: 'name', label: 'common.name', value: (branch) => branch.name.en },
        { id: 'email', label: 'common.email', value: (branch) => branch.email },
        { id: 'status', label: 'common.status', value: (branch) => branch.status },
      ],
    },
    show: {
      title: (branch) => branch.name.en,
      fields: [
        { label: 'common.englishName', value: (branch) => branch.name.en },
        { label: 'common.arabicName', value: (branch) => branch.name.ar },
        { label: 'common.brandId', value: (branch) => branch.brandId },
        { label: 'common.email', value: (branch) => branch.email },
        { label: 'common.status', value: (branch) => branch.status },
        { label: 'common.latitude', value: (branch) => branch.latitude ?? '—' },
        { label: 'common.longitude', value: (branch) => branch.longitude ?? '—' },
      ],
    },
  },
  overrides: {
    fromApi: (response) => mapBranchFromWire(response as BranchWire),
    schema: { create: createSchema },
    toCreatePayload: mapBranchInputToWire,
    toUpdatePayload: mapBranchInputToWire,
  },
});
