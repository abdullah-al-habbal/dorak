export const serviceKeys = {
  all: ["services"] as const,
  list: (search: string | undefined) => ["services", "list", search ?? ""] as const,
  currencies: ["currencies"] as const,
  // Not under "services": a service write must not refetch the category list, and vice versa.
  categories: ["service-categories"] as const,
};
