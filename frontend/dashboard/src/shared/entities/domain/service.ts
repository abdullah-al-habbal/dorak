import type { ServiceableType } from './serviceable-type';

/**
 * Domain record. Every property is camelCase; the snake_case API contract lives
 * behind `ServiceResource` on the backend and is translated only by this module.
 */
export interface LocalizedServiceName {
  readonly ar: string;
  readonly en: string;
}

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
