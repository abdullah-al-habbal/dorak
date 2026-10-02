import type { ApiPaginationWire } from './api-pagination-wire';

/** Response metadata attached by the backend list endpoints. */
export interface ApiMeta {
  pagination?: ApiPaginationWire;
}
