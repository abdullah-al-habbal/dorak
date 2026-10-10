import type { ApiMeta } from './api-meta-wire';

/** Envelope the backend wraps every dashboard response in. */
export interface ApiEnvelope<TData> {
  success: true;
  data: TData;
  message: string;
  request_id?: string;
  meta?: ApiMeta;
}
