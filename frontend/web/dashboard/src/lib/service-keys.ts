import { createQueryKeys, queryKey } from "@/lib/create-query-keys.util";

export const serviceKeys = {
  ...createQueryKeys("services", {
    list: (search: string | undefined) => ["list", search ?? ""] as const,
  }),
  currencies: queryKey("currencies"),
  // Not under "services": a service write must not refetch the category list, and vice versa.
  categories: queryKey("service-categories"),
};
