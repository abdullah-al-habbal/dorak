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
import { Checkbox } from "@/components/tailgrids/core/checkbox";
import { useDashboardMutation } from "@/hooks/use-dashboard-mutation";
import { useDictionary } from "@/hooks/use-dictionary";
import { apiErrorMessage } from "@/services/api/core/api-error-message.util";
import { getLookupOptions } from "@/services/api/common/lookup/lookup.query";
import { getSettings } from "@/services/api/dashboard/profile/profile.query";
import { updateSettings } from "@/services/api/dashboard/profile/profile.mutation";
import type { IUpdateSettingsInput } from "@/services/api/dashboard/profile/types/iupdate-settings-input.types";
import { UpdateSettingsInputSchema } from "@/services/api/dashboard/shared/schemas/dashboard-profile.schema";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
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
  const preferredLanguage = useWatch({
    control: form.control,
    name: "preferredLanguage",
  });
  const displayCurrencyCode = useWatch({
    control: form.control,
    name: "displayCurrencyCode",
  });
  const theme = useWatch({ control: form.control, name: "theme" });
  const priceDisplayMode = useWatch({
    control: form.control,
    name: "priceDisplayMode",
  });

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
            value={preferredLanguage ?? ""}
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
            value={displayCurrencyCode ?? ""}
            onChange={(selected) =>
              form.setValue(
                "displayCurrencyCode",
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
            value={theme ?? ""}
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
            value={priceDisplayMode ?? ""}
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

        <Controller
          control={form.control}
          name="isNotificationEnabled"
          render={({ field }) => (
            <Checkbox
              className="sm:col-span-2"
              isSelected={field.value ?? true}
              onChange={field.onChange}
            >
              {labels.isNotificationEnabled}
            </Checkbox>
          )}
        />

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
