import type { ServiceableType } from '../serviceable-type';
import type { LocalizedServiceName } from './localized-service-name';

/**
 * Domain record. Every property is camelCase; the snake_case API contract lives
 * behind `ServiceResource` on the backend and is translated only by
 * `wire/service-wire.ts`.
 */
export interface Service {
  readonly active: boolean;
  readonly catalogItemId: string | null;
  readonly currencyId: string;
  readonly duration: number | null;
  readonly id: string;
  readonly name: LocalizedServiceName;
  readonly price: number;
  readonly serviceableId: string;
  readonly serviceableType: ServiceableType;
}
