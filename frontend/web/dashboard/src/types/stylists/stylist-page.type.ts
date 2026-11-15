import type { PageInfo } from "@/types/core/page-info.type";
import type { Stylist } from "@/types/stylists/stylist.type";

export interface StylistPage {
  items: Stylist[];
  page: PageInfo;
}
