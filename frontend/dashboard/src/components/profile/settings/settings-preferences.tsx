"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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
import { useDashboardMutation } from "@/hooks/use-dashboard-mutation";
import { useDictionary } from "@/hooks/use-dictionary";
import { apiErrorMessage } from "@/services/api/api-error-message.util";
import { getLookupOptions } from "@/services/api/lookup.query";
import { getSettings } from "@/services/api/dashboard/profile.query";
import { updateSettings } from "@/services/api/dashboard/profile.mutation";
import type { IUpdateSettingsInput } from "@/services/api/dashboard/iupdate-settings-input.types";
import { UpdateSettingsInputSchema } from "@/services/api/dashboard/schema/dashboard-profile.schema";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
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
  const form = useForm<IUpdateSettingsInput>({
    resolver: zodResolver(UpdateSettingsInputSchema),
    defaultValues: {},
  });
  useEffect(() => {
    if (settings.data) form.reset(settings.data);
  }, [settings.data, form]);
  const save = useDashboardMutation("settings", (value: IUpdateSettingsInput) =>
    updateSettings(value),
  );

  return (
    <Card className="bg-transparent p-5">
      <h2 className="text-xl font-semibold text-text-primary">{copy.title}</h2>
      <form
        className="mt-6 grid gap-4 sm:grid-cols-2"
        onSubmit={form.handleSubmit((value) =>
          save.mutate(value, {
            onSuccess: () => toast.success(copy.title),
            onError: (error) => toast.error(apiErrorMessage(error, dictionary)),
          }),
        )}
      >
        <label className="grid gap-2 text-sm text-text-primary">
          <span>{labels.language}</span>
          <Select
            value={form.watch("preferredLanguage") ?? ""}
            onChange={(selected) =>
              form.setValue(
                "preferredLanguage",
                (selected || null) as "en" | "ar" | null,
              )
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
            value={form.watch("displayCurrencyId") ?? ""}
            onChange={(selected) =>
              form.setValue(
                "displayCurrencyId",
                (selected || null) as string | null,
              )
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
            value={form.watch("theme") ?? ""}
            onChange={(selected) =>
              form.setValue(
                "theme",
                (selected || null) as "light" | "dark" | null,
              )
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
            value={form.watch("priceDisplayMode") ?? ""}
            onChange={(selected) =>
              form.setValue(
                "priceDisplayMode",
                (selected || null) as "tax_inclusive" | "tax_exclusive" | null,
              )
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
            checked={form.watch("notificationEnabled") ?? true}
            onChange={(event) =>
              form.setValue("notificationEnabled", event.target.checked)
            }
          />
          {labels.notificationEnabled}
        </label>

        <Button
          className="sm:col-span-2"
          type="submit"
          isDisabled={save.isPending}
        >
          {labels.save}
        </Button>
      </form>
    </Card>
  );
}
