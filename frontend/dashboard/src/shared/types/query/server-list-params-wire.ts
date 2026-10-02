/** List query parameters as the backend expects them on the query string. */
export interface ServerListParams {
  page: number;
  per_page: number;
  search?: string | undefined;
}
