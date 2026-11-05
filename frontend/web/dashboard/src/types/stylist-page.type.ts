import type { PageInfo } from "@/types/page-info.type";
import type { Stylist } from "@/types/stylist.type";

export interface StylistPage {
  items: Stylist[];
  page: PageInfo;
}
