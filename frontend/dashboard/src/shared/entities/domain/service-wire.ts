import type { LocalizedServiceName, Service } from './service';
import type { ServiceableType } from './serviceable-type';

/**
 * The only module permitted to name a snake_case property. It mirrors
 * `ServiceResource` exactly as the backend emits it, and is the single place
 * where the API contract is translated into the camelCase domain model.
 */
export interface ServiceWire {
  readonly active: boolean;
  readonly at_home: boolean;
  readonly catalog_item_id: string | null;
  readonly created_at: string | null;
  readonly currency_id: string;
  readonly description: string | null;
  readonly duration: number | null;
  readonly id: string;
  readonly name: LocalizedServiceName;
  readonly price: number;
  readonly serviceable_id: string;
  readonly serviceable_type: ServiceableType;
}

/** The subset `ServiceRequest` validates on create and update. */
export type ServicePayloadWire = Omit<ServiceWire, 'at_home' | 'created_at' | 'description' | 'id'>;

/** Zod-inferred service form values, before any field is left blank. */
interface ServiceFormInput {
  readonly active: boolean;
  readonly catalogItemId: string | null | undefined;
  readonly currencyId: string;
  readonly duration: number | undefined;
  readonly name: LocalizedServiceName;
  readonly price: number;
  readonly serviceableId: string;
  readonly serviceableType: ServiceableType;
}

export function mapServiceFromWire(wire: ServiceWire): Service {
  return {
    active: wire.active,
    catalogItemId: wire.catalog_item_id,
    currencyId: wire.currency_id,
    duration: wire.duration,
    id: wire.id,
    name: wire.name,
    price: wire.price,
    serviceableId: wire.serviceable_id,
    serviceableType: wire.serviceable_type,
  };
}

export function mapServiceInputToWire(input: ServiceFormInput): ServicePayloadWire {
  return {
    active: input.active,
    catalog_item_id: input.catalogItemId ?? null,
    currency_id: input.currencyId,
    duration: input.duration ?? null,
    name: input.name,
    price: input.price,
    serviceable_id: input.serviceableId,
    serviceable_type: input.serviceableType,
  };
}
