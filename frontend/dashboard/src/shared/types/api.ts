export interface ApiEnvelope<TData> {
  success: true;
  data: TData;
  message: string;
  request_id?: string;
  meta?: ApiMeta;
}

export interface ApiMeta {
  pagination?: {
    count: number;
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface ApiErrorPayload {
  message?: string;
  errors?: Record<string, string[]>;
  request_id?: string;
}
