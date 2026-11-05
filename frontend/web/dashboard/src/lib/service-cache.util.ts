import type { Service } from "@/types/service.type";

/** Returns the list with one service's active flag replaced; the same list when it is absent. */
export function withServiceActive(services: Service[] | undefined, id: string, active: boolean): Service[] | undefined {
  if (!services?.some((service) => service.id === id)) return services;
  return services.map((service) => (service.id === id ? { ...service, is_active: active } : service));
}
