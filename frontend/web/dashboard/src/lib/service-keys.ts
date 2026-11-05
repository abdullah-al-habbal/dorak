export const serviceKeys = {
  all: ["services"] as const,
  list: (search: string | undefined) => ["services", "list", search ?? ""] as const,
  currencies: ["currencies"] as const,
};
