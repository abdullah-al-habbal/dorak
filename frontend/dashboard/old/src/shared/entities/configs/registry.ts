import type { RegisteredEntityConfig } from '../types/registered-entity-config';
import {
  ChairFilterOptions,
  StylistFilterOptions,
} from '../workflows/bookings/booking-filter-options';
import { BookingRowActions } from '../workflows/bookings/booking-row-actions';
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
    ui: {
      ...bookingsConfig.ui,
      list: {
        ...bookingsConfig.ui.list,
        filters: bookingsConfig.ui.list.filters?.map((filter) => {
          if (filter.param === 'chairId') {
            return { ...filter, renderOptions: ChairFilterOptions };
          }
          if (filter.param === 'stylistId') {
            return { ...filter, renderOptions: StylistFilterOptions };
          }
          return filter;
        }),
        rowActions: BookingRowActions,
      },
    },
    overrides: {
      ...bookingsConfig.overrides,
      renderForm: WalkInBookingForm,
      renderShow: BookingShow,
    },
  },
  chairs: chairsConfig,
  services: servicesConfig,
  stylists: stylistsConfig,
} as const;

export function getEntityConfig(slug: string): RegisteredEntityConfig | undefined {
  const config = Object.values(entityConfigs).find((candidate) => candidate.slug === slug);
  return config as RegisteredEntityConfig | undefined;
}
