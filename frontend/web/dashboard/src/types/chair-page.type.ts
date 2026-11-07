import type { Chair } from "@/types/chair.type";
import type { PageInfo } from "@/types/page-info.type";

export interface ChairPage {
  items: Chair[];
  page: PageInfo;
}
