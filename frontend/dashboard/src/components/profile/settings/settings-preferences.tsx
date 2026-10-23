"use client";

import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import { useDictionary } from "@/hooks/use-dictionary";
import { apiErrorMessage } from "@/services/api/api-error-message.util";
import { getLookupOptions } from "@/services/api/lookup.query";
import { getSettings } from "@/services/api/dashboard/profile.query";
import { updateSettings } from "@/services/api/dashboard/profile.mutation";
import type { IUpdateSettingsInput } from "@/services/api/dashboard/iupdate-settings-input.types";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export function SettingsPreferences() {
  const dictionary = useDictionary();
  const copy = dictionary.profile.tabs.settings;
  const labels = dictionary.profile.settings;
  const settings = useQuery({
    queryKey: ["dashboard", "settings"],
    queryFn: getSettings,
  });
  const currencies = useQuery({
    queryKey: ["lookups", "currencies"],
    queryFn: () => getLookupOptions("currencies"),
  });
  const [draft, setDraft] = useState<IUpdateSettingsInput>({});

  const value = <K extends keyof IUpdateSettingsInput>(
    key: K,
  ): IUpdateSettingsInput[K] | undefined =>
    draft[key] !== undefined ? draft[key] : settings.data?.[key];

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await updateSettings(draft);
      toast.success(copy.title);
      setDraft({});
      await settings.refetch();
    } catch (error) {
      toast.error(apiErrorMessage(error, dictionary));
    }
  }

  return (
    <Card className="bg-transparent p-5">
      <h2 className="text-xl font-semibold text-text-primary">{copy.title}</h2>
      <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={save}>
        <label className="grid gap-2 text-sm text-text-primary">
          <span>{labels.language}</span>
          <Select
            value={value("preferredLanguage") ?? ""}
            onChange={(selected) =>
              setDraft((current) => ({
                ...current,
                preferredLanguage: (selected || null) as "en" | "ar" | null,
              }))
            }
          >
            <SelectTrigger>
              <SelectValue />
              <SelectIndicator />
            </SelectTrigger>
            <SelectContent>
              <SelectItem id="en">{labels.languageEn}</SelectItem>
              <SelectItem id="ar">{labels.languageAr}</SelectItem>
            </SelectContent>
          </Select>
        </label>

        <label className="grid gap-2 text-sm text-text-primary">
          <span>{labels.currency}</span>
          <Select
            value={value("displayCurrencyId") ?? ""}
            onChange={(selected) =>
              setDraft((current) => ({
                ...current,
                displayCurrencyId: (selected || null) as string | null,
              }))
            }
          >
            <SelectTrigger>
              <SelectValue />
              <SelectIndicator />
            </SelectTrigger>
            <SelectContent>
              {(currencies.data ?? []).map((currency) => (
                <SelectItem id={currency.id} key={currency.id}>
                  {currency.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        <label className="grid gap-2 text-sm text-text-primary">
          <span>{labels.theme}</span>
          <Select
            value={value("theme") ?? ""}
            onChange={(selected) =>
              setDraft((current) => ({
                ...current,
                theme: (selected || null) as "light" | "dark" | null,
              }))
            }
          >
            <SelectTrigger>
              <SelectValue />
              <SelectIndicator />
            </SelectTrigger>
            <SelectContent>
              <SelectItem id="light">{labels.themeLight}</SelectItem>
              <SelectItem id="dark">{labels.themeDark}</SelectItem>
            </SelectContent>
          </Select>
        </label>

        <label className="grid gap-2 text-sm text-text-primary">
          <span>{labels.priceDisplayMode}</span>
          <Select
            value={value("priceDisplayMode") ?? ""}
            onChange={(selected) =>
              setDraft((current) => ({
                ...current,
                priceDisplayMode: (selected || null) as
                  | "tax_inclusive"
                  | "tax_exclusive"
                  | null,
              }))
            }
          >
            <SelectTrigger>
              <SelectValue />
              <SelectIndicator />
            </SelectTrigger>
            <SelectContent>
              <SelectItem id="tax_inclusive">
                {labels.priceDisplayModeTaxInclusive}
              </SelectItem>
              <SelectItem id="tax_exclusive">
                {labels.priceDisplayModeTaxExclusive}
              </SelectItem>
            </SelectContent>
          </Select>
        </label>

        <label className="flex items-center gap-3 text-sm text-text-primary sm:col-span-2">
          <input
            type="checkbox"
            checked={value("notificationEnabled") ?? true}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                notificationEnabled: event.target.checked,
              }))
            }
          />
          {labels.notificationEnabled}
        </label>

        <Button className="sm:col-span-2" type="submit">
          {labels.save}
        </Button>
      </form>
    </Card>
  );
}
