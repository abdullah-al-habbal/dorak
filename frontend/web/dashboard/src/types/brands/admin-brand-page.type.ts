import type { AdminBrand } from "@/types/brands/admin-brand.type";
import type { PageInfo } from "@/types/core/page-info.type";

export interface AdminBrandPage {
  items: AdminBrand[];
  page: PageInfo;
}
