import type { Service } from "@/types/service.type";

export interface ServiceGroup {
  /** Category id, or the uncategorised key. */
  key: string;
  /** Null for the uncategorised group, so the screen supplies the localised heading. */
  label: string | null;
  services: Service[];
}
