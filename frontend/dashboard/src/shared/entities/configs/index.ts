import type { FieldValues } from 'react-hook-form';
import type { EntityFieldTree } from '@/shared/entities/fields';
import type { EntityConfig, EntityRecord } from '@/shared/entities/types/entity-config';
import type { ServerListParams } from '@/shared/types/query';
import { BookingList } from '../workflows/bookings/booking-list';
import { BookingShow } from '../workflows/bookings/booking-show';
import { WalkInBookingForm } from '../workflows/bookings/walk-in-booking-form';
import { bookingsConfig } from './bookings.config';
import { branchesConfig } from './branches.config';
import { chairsConfig } from './chairs.config';
import { servicesConfig } from './services.config';
import { stylistsConfig } from './stylists.config';

export const entityConfigs = {
  branches: branchesConfig,
  bookings: {
    ...bookingsConfig,
    overrides: {
      ...bookingsConfig.overrides,
      renderForm: WalkInBookingForm,
      renderList: BookingList,
      renderShow: BookingShow,
    },
  },
  chairs: chairsConfig,
  services: servicesConfig,
  stylists: stylistsConfig,
} as const;

export type RegisteredEntityConfig = EntityConfig<
  EntityRecord,
  FieldValues,
  EntityFieldTree,
  ServerListParams
>;

export function getEntityConfig(slug: string): RegisteredEntityConfig | undefined {
  const config = Object.values(entityConfigs).find((candidate) => candidate.slug === slug);
  return config as RegisteredEntityConfig | undefined;
}

export { branchesConfig } from './branches.config';
export { bookingsConfig } from './bookings.config';
export { chairsConfig } from './chairs.config';
export { servicesConfig } from './services.config';
export { stylistsConfig } from './stylists.config';
