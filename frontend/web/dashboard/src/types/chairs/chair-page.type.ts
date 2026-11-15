import type { Chair } from "@/types/chairs/chair.type";
import type { PageInfo } from "@/types/core/shared/page-info.type";

export interface ChairPage {
  items: Chair[];
  page: PageInfo;
}
