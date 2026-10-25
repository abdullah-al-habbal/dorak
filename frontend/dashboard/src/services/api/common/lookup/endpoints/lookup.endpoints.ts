const BASE = "/lookups";

export const LookupEndpoints = {
  options: (resource: string) => `${BASE}/${resource}`,
} as const;
