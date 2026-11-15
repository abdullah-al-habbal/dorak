import type { BarberStatus } from "@/enums/people/barber-status.enum";
import type { StylistPage } from "@/types/stylists/stylist-page.type";

/** Returns the page with one stylist's status replaced; untouched pages are returned as-is. */
export function withStylistStatus(page: StylistPage | undefined, id: string, status: BarberStatus): StylistPage | undefined {
  if (!page?.items.some((stylist) => stylist.id === id)) return page;
  return { ...page, items: page.items.map((stylist) => (stylist.id === id ? { ...stylist, status } : stylist)) };
}
