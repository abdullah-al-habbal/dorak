export interface ApiError {
  code: string;
  fields?: Record<string, string[]>;
}

/** Canonical contract for every dashboard HTTP boundary. */
export interface ApiSuccess<TData> {
  success: true;
  data: TData;
  message: string;
}

export interface ApiFailure {
  success: false;
  error: ApiError;
  message: string;
}

export type ApiResponse<TData> = ApiSuccess<TData> | ApiFailure;
