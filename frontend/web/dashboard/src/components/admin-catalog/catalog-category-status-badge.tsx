"use client";

import { CheckCircle2Icon, PauseCircleIcon } from "lucide-react";
import type { JSX } from "react";

import { Badge } from "@/components/ui/badge";
import { useDictionary } from "@/hooks/core/use-dictionary";

/** Icon plus text, never colour alone. */
export function CatalogCategoryStatusBadge({ active }: { active: boolean }): JSX.Element {
  const { adminCatalog } = useDictionary();
  const Icon = active ? CheckCircle2Icon : PauseCircleIcon;
  return (
    <Badge variant={active ? "success" : "outline"}>
      <Icon aria-hidden />
      {active ? adminCatalog.status.active : adminCatalog.status.inactive}
    </Badge>
  );
}
