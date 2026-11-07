"use client";

import type { JSX } from "react";

import { useDictionary } from "@/hooks/use-dictionary";
import type { PlanFieldsProps } from "@/interfaces/plan-fields-props.interface";
import { featureLabel } from "@/lib/subscription-format.util";

interface PlanFeatureFieldsProps extends PlanFieldsProps {
  featureKeys: readonly string[];
}

/** The plan's feature flags as native checkboxes (free keyboard, screen-reader and RTL behaviour). */
export function PlanFeatureFields({ form, featureKeys }: PlanFeatureFieldsProps): JSX.Element {
  const { plans: t, subscription } = useDictionary();
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 text-sm font-medium">{t.form.features}</legend>
      {featureKeys.length === 0 ? <p className="text-sm text-muted-foreground">{t.form.noFeatureKeys}</p> : null}
      {featureKeys.map((key) => (
        <label key={key} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-border bg-card px-3 text-sm">
          <input type="checkbox" value={key} className="size-4 accent-primary" {...form.register("feature_keys")} />
          {featureLabel(key, subscription.features.labels)}
        </label>
      ))}
    </fieldset>
  );
}
