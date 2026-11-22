"use client";

import { CheckIcon, MinusIcon } from "lucide-react";
import type { JSX } from "react";

import { useDictionary } from "@/hooks/core/state/use-dictionary";
import { featureLabel } from "@/lib/plans/subscription-format.util";

/** Effective flags of the brand. State is icon plus text, never colour alone. */
export function FeatureList({ features }: { features: Readonly<Record<string, boolean>> }): JSX.Element {
  const { subscription: t, common } = useDictionary();
  return (
    <ul aria-label={t.features.title} className="flex flex-col gap-2 text-sm">
      {Object.entries(features).map(([key, enabled]) => (
        <li key={key} className="flex items-center gap-2">
          {enabled ? <CheckIcon className="size-4 text-success" aria-hidden /> : <MinusIcon className="size-4 text-muted-foreground" aria-hidden />}
          <span>{featureLabel(key, t.features.labels, common.unknown)}</span>
          <span className="ms-auto text-xs text-muted-foreground">{enabled ? t.features.on : t.features.off}</span>
        </li>
      ))}
    </ul>
  );
}
