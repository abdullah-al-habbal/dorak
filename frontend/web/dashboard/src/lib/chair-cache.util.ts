import type { ChairStatus } from "@/enums/chair-status.enum";
import type { ChairPage } from "@/types/chair-page.type";

/** Returns the page with one chair's stored status replaced; untouched pages are returned as-is. */
export function withChairStatus(page: ChairPage | undefined, id: string, status: ChairStatus): ChairPage | undefined {
  if (!page?.items.some((chair) => chair.id === id)) return page;
  return {
    ...page,
    items: page.items.map((chair) => (chair.id === id ? { ...chair, configured_status: status, status } : chair)),
  };
}
