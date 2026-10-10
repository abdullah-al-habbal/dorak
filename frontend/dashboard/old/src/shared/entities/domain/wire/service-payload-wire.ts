import type { ServiceWire } from './service-wire';

/** The subset `ServiceRequest` validates on create and update. */
export type ServicePayloadWire = Omit<ServiceWire, 'at_home' | 'created_at' | 'description' | 'id'>;
