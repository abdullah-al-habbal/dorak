const MAX_SEARCH = 100;

export function searchFromParams(params: URLSearchParams): string | undefined {
  return params.get("search")?.trim().slice(0, MAX_SEARCH) || undefined;
}

/** No search means no params, so the URL falls back to the bare path. */
export function searchToParams(search: string | undefined): URLSearchParams {
  return new URLSearchParams(search ? { search } : {});
}
