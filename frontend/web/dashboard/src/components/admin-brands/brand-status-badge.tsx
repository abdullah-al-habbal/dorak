"use client";

import type { JSX } from "react";

import { BRAND_STATUS_STYLE } from "@/config/platform/admin-brand.constant";
import type { BrandStatus } from "@/enums/venue/brand-status.enum";
import { StatusBadge } from "@/components/common/status-badge";
import { useDictionary } from "@/hooks/core/state/use-dictionary";

export function BrandStatusBadge({ status }: { status: BrandStatus }): JSX.Element {
  const { adminBrands } = useDictionary();
  return <StatusBadge status={status} styles={BRAND_STATUS_STYLE} labels={adminBrands.status} scope="brand" />;
}
