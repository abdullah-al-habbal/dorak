"use client";

import type { JSX } from "react";

import { FormErrorBanner } from "@/components/common/form-error-banner";
import { PlatformSettingGroup } from "@/components/platform-settings/platform-setting-group";
import { Button } from "@/components/ui/button";
import { SETTING_GROUP_ORDER } from "@/config/platform-settings.constant";
import { useDictionary } from "@/hooks/use-dictionary";
import { usePlatformSettingsForm } from "@/hooks/use-platform-settings-form";
import { groupSettings } from "@/lib/platform-settings.util";
import type { PlatformSetting } from "@/types/platform/platform-setting.type";

export function PlatformSettingsForm({ settings }: { settings: readonly PlatformSetting[] }): JSX.Element {
  const { settings: t } = useDictionary();
  const { form, busy, dirty, submit, discard, resetToDefault } = usePlatformSettingsForm(settings);

  return (
    <form onSubmit={submit} noValidate className="flex scroll-pb-24 flex-col gap-5">
      {SETTING_GROUP_ORDER.map((group) => {
        const members = groupSettings(settings, group);
        return members.length > 0 ? <PlatformSettingGroup key={group} group={group} settings={members} form={form} onResetToDefault={resetToDefault} /> : null;
      })}
      <div className="sticky bottom-0 -mx-1 flex flex-wrap items-center justify-end gap-3 border-t border-border bg-background/95 px-1 py-3 backdrop-blur">
        <FormErrorBanner message={form.formState.errors.root?.message} />
        <p aria-live="polite" className="me-auto text-sm text-muted-foreground">{dirty ? t.actions.unsaved : t.actions.saved}</p>
        <Button type="button" variant="outline" disabled={!dirty || busy} onClick={discard}>{t.actions.discard}</Button>
        <Button type="submit" disabled={!dirty || busy}>{busy ? t.actions.saving : t.actions.save}</Button>
      </div>
    </form>
  );
}
