const LOOKUP_API_BASE_PATH = "/lookups";

export const LookupEndpoints = {
  options: (resource: string) => `${LOOKUP_API_BASE_PATH}/${resource}`,
} as const;
