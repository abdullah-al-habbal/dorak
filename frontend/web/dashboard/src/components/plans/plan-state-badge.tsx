"use client";

import { CheckCircle2Icon, PauseCircleIcon } from "lucide-react";
import type { JSX } from "react";

import { Badge } from "@/components/ui/badge";
import { useDictionary } from "@/hooks/core/use-dictionary";

/** Icon plus text, never colour alone. */
export function PlanStateBadge({ active }: { active: boolean }): JSX.Element {
  const { plans } = useDictionary();
  const Icon = active ? CheckCircle2Icon : PauseCircleIcon;
  return (
    <Badge variant={active ? "success" : "outline"}>
      <Icon aria-hidden />
      {active ? plans.state.active : plans.state.inactive}
    </Badge>
  );
}
