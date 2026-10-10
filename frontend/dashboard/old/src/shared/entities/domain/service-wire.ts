import type { Service } from './types/service';
import type { ServiceFormInput } from './wire/service-form-input';
import type { ServicePayloadWire } from './wire/service-payload-wire';
import type { ServiceWire } from './wire/service-wire';

export type { ServiceFormInput } from './wire/service-form-input';
export type { ServicePayloadWire } from './wire/service-payload-wire';
export type { ServiceWire } from './wire/service-wire';

/**
 * The only module that translates the API contract into the camelCase domain
 * model. The snake_case property names themselves live in `wire/service-wire.ts`.
 */
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
