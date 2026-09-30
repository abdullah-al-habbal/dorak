export interface ApiEnvelope<TData> {
  success: true;
  data: TData;
  message: string;
  request_id?: string;
}

export interface ApiErrorPayload {
  message?: string;
  errors?: Record<string, string[]>;
  request_id?: string;
}
