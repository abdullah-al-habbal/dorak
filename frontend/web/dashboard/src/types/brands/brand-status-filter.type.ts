import type { BRAND_STATUS_FILTER_ALL } from "@/config/platform/admin-brand.constant";
import type { BrandStatus } from "@/enums/venue/brand-status.enum";

export type BrandStatusFilter = BrandStatus | typeof BRAND_STATUS_FILTER_ALL;
