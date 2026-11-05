const MAX_SEARCH = 100;

export function searchFromParams(params: URLSearchParams): string | undefined {
  return params.get("search")?.trim().slice(0, MAX_SEARCH) || undefined;
}

export function searchToQuery(search: string | undefined): string {
  return search ? new URLSearchParams({ search }).toString() : "";
}
