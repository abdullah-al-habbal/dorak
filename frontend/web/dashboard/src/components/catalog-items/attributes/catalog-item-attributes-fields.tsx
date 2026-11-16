"use client";

import type { JSX } from "react";

import { FormField } from "@/components/common/form-field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { FaceShape } from "@/enums/catalog/face-shape.enum";
import { HairTexture } from "@/enums/catalog/hair-texture.enum";
import { useCurrencies } from "@/hooks/platform/currencies/use-currencies";
import { useI18n } from "@/hooks/core/state/use-i18n";
import type { CatalogItemAttributes } from "@/interfaces/services/catalog-item-attributes.interface";

interface CatalogItemAttributesFieldsProps {
  value: CatalogItemAttributes;
  onChange: (value: CatalogItemAttributes) => void;
}

interface ChoiceSelectProps {
  id: string;
  label: string;
  value: string;
  options: Record<string, string>;
  notSet: string;
  onChange: (value: string) => void;
}

function ChoiceSelect({ id, label, value, options, notSet, onChange }: ChoiceSelectProps): JSX.Element {
  return (
    <FormField id={id} label={label}>
      <NativeSelect id={id} value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">{notSet}</option>
        {Object.entries(options).map(([key, text]) => (
          <option key={key} value={key}>{text}</option>
        ))}
      </NativeSelect>
    </FormField>
  );
}

function toggled<T>(list: readonly T[], item: T, on: boolean): T[] {
  return on ? [...list, item] : list.filter((value) => value !== item);
}

/** The optional price range and style attributes of a catalog item; everything may stay unset. */
export function CatalogItemAttributesFields({ value, onChange }: CatalogItemAttributesFieldsProps): JSX.Element {
  const { dictionary } = useI18n();
  const t = dictionary.adminCatalog.items.attributes;
  const currencies = useCurrencies();
  const set = (patch: Partial<CatalogItemAttributes>): void => onChange({ ...value, ...patch });

  return (
    <fieldset className="flex flex-col gap-4 rounded-xl border border-border p-4">
      <legend className="px-1 text-sm font-medium">{t.title}</legend>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <FormField id="item-price-min" label={t.priceMin}>
          <Input id="item-price-min" inputMode="decimal" dir="ltr" autoComplete="off" value={value.priceMin} onChange={(event) => set({ priceMin: event.target.value })} />
        </FormField>
        <FormField id="item-price-max" label={t.priceMax}>
          <Input id="item-price-max" inputMode="decimal" dir="ltr" autoComplete="off" value={value.priceMax} onChange={(event) => set({ priceMax: event.target.value })} />
        </FormField>
        <FormField id="item-price-currency" label={t.currency}>
          <NativeSelect id="item-price-currency" value={value.currency} onChange={(event) => set({ currency: event.target.value })}>
            <option value="">{t.notSet}</option>
            {currencies.data?.map((currency) => (
              <option key={currency.code} value={currency.code}>{currency.code}</option>
            ))}
          </NativeSelect>
        </FormField>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <ChoiceSelect id="item-maintenance" label={t.maintenance} value={value.maintenance} options={t.maintenanceLevel} notSet={t.notSet} onChange={(maintenance) => set({ maintenance })} />
        <ChoiceSelect id="item-period" label={t.stylePeriod} value={value.stylePeriod} options={t.period} notSet={t.notSet} onChange={(stylePeriod) => set({ stylePeriod })} />
        <ChoiceSelect id="item-formality" label={t.formality} value={value.formality} options={t.formalityLevel} notSet={t.notSet} onChange={(formality) => set({ formality })} />
      </div>
      <fieldset className="flex flex-col gap-1">
        <legend className="mb-1 text-sm font-medium">{t.faceShapes}</legend>
        <div className="flex flex-wrap gap-2">
          {Object.values(FaceShape).map((shape) => (
            <label key={shape} className="flex min-h-9 cursor-pointer items-center gap-2 rounded-lg border border-border px-3 text-sm has-[:checked]:border-primary">
              <input type="checkbox" className="size-4 accent-primary" checked={value.faceShapes.includes(shape)} onChange={(event) => set({ faceShapes: toggled(value.faceShapes, shape, event.target.checked) })} />
              {t.faceShape[shape]}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className="flex flex-col gap-1">
        <legend className="mb-1 text-sm font-medium">{t.hairTextures}</legend>
        <div className="flex flex-wrap gap-2">
          {Object.values(HairTexture).map((texture) => (
            <label key={texture} className="flex min-h-9 cursor-pointer items-center gap-2 rounded-lg border border-border px-3 text-sm has-[:checked]:border-primary">
              <input type="checkbox" className="size-4 accent-primary" checked={value.hairTextures.includes(texture)} onChange={(event) => set({ hairTextures: toggled(value.hairTextures, texture, event.target.checked) })} />
              {t.hairTexture[texture]}
            </label>
          ))}
        </div>
      </fieldset>
    </fieldset>
  );
}
