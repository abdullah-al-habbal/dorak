"use client";

import type { JSX } from "react";

import { Badge } from "@/components/ui/badge";
import { BRAND_STATUS_STYLE } from "@/config/admin-brand.constant";
import type { BrandStatus } from "@/enums/brand-status.enum";
import { useDictionary } from "@/hooks/core/use-dictionary";

export function BrandStatusBadge({ status }: { status: BrandStatus }): JSX.Element {
  const { adminBrands } = useDictionary();
  const { variant, icon: Icon } = BRAND_STATUS_STYLE[status];
  return (
    <Badge variant={variant}>
      <Icon aria-hidden />
      {adminBrands.status[status]}
    </Badge>
  );
}
