export const planKeys = {
  all: ["admin-plans"] as const,
  list: (state: string, page: number) => ["admin-plans", "list", state, page] as const,
  options: ["admin-plans", "options"] as const,
  featureKeys: ["admin-plans", "feature-keys"] as const,
};
