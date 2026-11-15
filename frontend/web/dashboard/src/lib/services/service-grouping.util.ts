import type { ServiceGroup } from "@/interfaces/services/service-group.interface";
import { localizedText } from "@/lib/core/booking-format.util";
import type { Service } from "@/types/services/service.type";

export const UNCATEGORISED_KEY = "__uncategorised__";

/** Groups services by catalog category (sorted by name), with uncategorised services last. */
export function groupByCategory(services: readonly Service[], locale: string): ServiceGroup[] {
  const groups = new Map<string, ServiceGroup>();
  for (const service of services) {
    const key = service.category?.id ?? UNCATEGORISED_KEY;
    const label = service.category ? localizedText(service.category.name, locale) || null : null;
    const group = groups.get(key) ?? { key, label, services: [] };
    group.services.push(service);
    groups.set(key, group);
  }
  return [...groups.values()].sort((a, b) => {
    if (a.key === UNCATEGORISED_KEY) return 1;
    if (b.key === UNCATEGORISED_KEY) return -1;
    return (a.label ?? "").localeCompare(b.label ?? "", locale);
  });
}
