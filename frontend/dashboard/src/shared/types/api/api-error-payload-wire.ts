/** Error body the backend returns on a failed dashboard request. */
export interface ApiErrorPayload {
  message?: string;
  errors?: Record<string, string[]>;
  request_id?: string;
}
