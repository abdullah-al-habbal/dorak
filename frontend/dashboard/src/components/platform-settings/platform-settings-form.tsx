"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";
import { useDictionary } from "@/hooks/use-dictionary";
import {
  notifyApiError,
  notifySuccess,
} from "@/services/api/core/notifications";
import {
  PLATFORM_SETTING_GROUPS,
  PLATFORM_SETTINGS_QUERY_KEYS,
} from "@/services/api/dashboard/settings/settings.constant";
import { savePlatformSettings } from "@/services/api/dashboard/settings/settings.query";
import {
  buildPlatformSettingsFormSchema,
  platformSettingsFormDefaults,
} from "@/services/api/dashboard/settings/settings.util";
import type { IPlatformSetting } from "@/services/api/dashboard/settings/types/iplatform-setting.types";
import type { IPlatformSettingsForm } from "@/services/api/dashboard/settings/types/iplatform-settings-form.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

interface IPlatformSettingsFormProps {
  settings: IPlatformSetting[];
}

export function PlatformSettingsForm({ settings }: IPlatformSettingsFormProps) {
  const dictionary = useDictionary();
  const copy = dictionary.platformSettings;
  const queryClient = useQueryClient();
  const form = useForm<IPlatformSettingsForm>({
    resolver: zodResolver(buildPlatformSettingsFormSchema(settings)),
    defaultValues: platformSettingsFormDefaults(settings),
  });
  const { errors } = form.formState;
  const save = useMutation({
    mutationFn: (value: IPlatformSettingsForm) =>
      savePlatformSettings({ form: value, settings }),
    onSuccess: async () => {
      notifySuccess(copy.saved);
      await queryClient.invalidateQueries({
        queryKey: PLATFORM_SETTINGS_QUERY_KEYS.all,
      });
    },
    onError: (error) => notifyApiError(error, dictionary),
  });

  return (
    <form
      className="space-y-8"
      onSubmit={form.handleSubmit((value) => save.mutate(value))}
    >
      {PLATFORM_SETTING_GROUPS.map((group) => (
        <fieldset key={group} className="grid gap-4 md:grid-cols-2">
          <legend className="mb-2 text-lg font-semibold text-title-50">
            {copy.groups[group]}
          </legend>
          {settings
            .filter((setting) => setting.group === group)
            .map((setting) => (
              <label
                key={setting.key}
                className="grid gap-1 text-sm text-text-100"
              >
                <span>{copy.keys[setting.key]}</span>
                <Input
                  inputMode="numeric"
                  state={errors[setting.key] ? "error" : "default"}
                  {...form.register(setting.key)}
                />
                <span className="text-xs text-text-60">
                  {copy.range}: {setting.min}–{setting.max} ·{" "}
                  {copy.defaultValue}: {setting.default}
                </span>
              </label>
            ))}
        </fieldset>
      ))}
      <Button type="submit" isDisabled={save.isPending}>
        {copy.save}
      </Button>
    </form>
  );
}
