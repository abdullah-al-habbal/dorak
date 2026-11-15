"use client";

import type { JSX } from "react";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { BRAND_FEATURE_KEYS } from "@/config/admin-brand.constant";
import { useDictionary } from "@/hooks/core/use-dictionary";
import { useUpdateBrandFeatures } from "@/hooks/brands/use-update-brand-features";
import type { AdminBrand } from "@/types/brands/admin-brand.type";

/** The brand's premium flags. An override switches one on or off for this brand regardless of its plan. */
export function BrandFeaturesSection({ brand }: { brand: AdminBrand }): JSX.Element {
  const { adminBrands: t } = useDictionary();
  const update = useUpdateBrandFeatures();

  return (
    <section aria-label={t.features.title} className="flex flex-col gap-2">
      <h3 className="text-sm font-medium">{t.features.title}</h3>
      <p className="text-xs text-muted-foreground">{t.features.hint}</p>
      <ul className="flex flex-col gap-2">
        {BRAND_FEATURE_KEYS.map((key) => (
          <li key={key} className="flex items-center justify-between gap-4 rounded-lg border border-border px-3 py-2">
            <Label htmlFor={`brand-feature-${key}`}>{t.features.labels[key]}</Label>
            <Switch
              id={`brand-feature-${key}`}
              checked={brand.features?.[key] === true}
              disabled={update.isPending}
              onCheckedChange={(checked) => update.mutate({ id: brand.id, flags: { [key]: checked } })}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
