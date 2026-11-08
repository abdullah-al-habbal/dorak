import type { BRAND_STATUS_FILTER_ALL } from "@/config/admin-brand.constant";
import type { BrandStatus } from "@/enums/brand-status.enum";

export type BrandStatusFilter = BrandStatus | typeof BRAND_STATUS_FILTER_ALL;
