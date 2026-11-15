"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";

import { useDictionary } from "@/hooks/core/state/use-dictionary";
import { useLeaveWarning } from "@/hooks/core/state/use-leave-warning";
import { useSavePlatformSettings } from "@/hooks/platform/settings/use-save-platform-settings";
import { changedSettings, settingsToForm } from "@/lib/platform/platform-settings.util";
import type { SettingFormValues } from "@/lib/platform/platform-settings.util";
import { mapSettingsSaveError } from "@/lib/platform/platform-settings-error.util";
import { createPlatformSettingsSchema } from "@/schemas/platform/platform-settings-form.zod";
import type { PlatformSetting } from "@/types/platform/platform-setting.type";

interface PlatformSettingsFormController {
  form: UseFormReturn<SettingFormValues>;
  busy: boolean;
  /** True when at least one field differs from what is saved. */
  dirty: boolean;
  submit: () => Promise<void>;
  discard: () => void;
  resetToDefault: (setting: PlatformSetting) => void;
}

/** Wires the settings form to the save mutation; only changed settings are sent. */
export function usePlatformSettingsForm(settings: readonly PlatformSetting[]): PlatformSettingsFormController {
  const { settings: t } = useDictionary();
  const save = useSavePlatformSettings();
  const schema = useMemo(() => createPlatformSettingsSchema(settings, t.validation), [settings, t.validation]);
  const saved = useMemo(() => settingsToForm(settings), [settings]);
  const form = useForm<SettingFormValues>({ resolver: zodResolver(schema), defaultValues: saved });
  const current = useWatch({ control: form.control });
  const busy = form.formState.isSubmitting || save.isPending;
  const dirty = Object.keys(changedSettings(current, settings)).length > 0;

  useLeaveWarning(dirty);

  const submit = form.handleSubmit(async (values) => {
    const changes = changedSettings(values, settings);
    if (Object.keys(changes).length === 0) return;
    try {
      await save.mutateAsync(changes);
      form.reset(values);
    } catch (error) {
      const mapped = mapSettingsSaveError(error, t.errors.generic);
      for (const [name, message] of Object.entries(mapped.fieldErrors)) form.setError(name, { message });
      if (mapped.formError) form.setError("root", { message: mapped.formError });
    }
  });

  return {
    form,
    busy,
    dirty,
    submit,
    discard: () => form.reset(saved),
    resetToDefault: (setting) => form.setValue(setting.setting_key, String(setting.default), { shouldDirty: true, shouldValidate: true }),
  };
}
