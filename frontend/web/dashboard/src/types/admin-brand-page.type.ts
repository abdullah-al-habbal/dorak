import type { AdminBrand } from "@/types/admin-brand.type";
import type { PageInfo } from "@/types/page-info.type";

export interface AdminBrandPage {
  items: AdminBrand[];
  page: PageInfo;
}
