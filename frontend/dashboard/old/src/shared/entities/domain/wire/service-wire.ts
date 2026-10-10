import type { ServiceableType } from '../serviceable-type';
import type { LocalizedServiceName } from '../types/localized-service-name';

/**
 * The only place permitted to name a snake_case property. It mirrors
 * `ServiceResource` exactly as the backend emits it.
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
