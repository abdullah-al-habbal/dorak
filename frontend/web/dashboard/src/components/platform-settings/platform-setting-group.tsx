import type { JSX } from "react";
import type { UseFormReturn } from "react-hook-form";

import { PlatformSettingField } from "@/components/platform-settings/platform-setting-field";
import { Card } from "@/components/ui/card";
import { useDictionary } from "@/hooks/core/use-dictionary";
import type { SettingGroup } from "@/enums/setting-group.enum";
import type { SettingFormValues } from "@/lib/platform-settings.util";
import type { PlatformSetting } from "@/types/platform/platform-setting.type";

interface PlatformSettingGroupProps {
  group: SettingGroup;
  settings: readonly PlatformSetting[];
  form: UseFormReturn<SettingFormValues>;
  onResetToDefault: (setting: PlatformSetting) => void;
}

export function PlatformSettingGroup({ group, settings, form, onResetToDefault }: PlatformSettingGroupProps): JSX.Element {
  const { settings: t } = useDictionary();
  return (
    <Card role="group" aria-labelledby={`settings-group-${group}`} className="gap-5 p-(--card-spacing)">
      <div className="flex flex-col gap-1">
        <h2 id={`settings-group-${group}`} className="font-heading text-lg font-semibold">{t.groups[group].title}</h2>
        <p className="max-w-prose text-sm text-muted-foreground">{t.groups[group].description}</p>
      </div>
      <div className="grid gap-x-8 gap-y-5 md:grid-cols-2">
        {settings.map((setting) => (
          <PlatformSettingField key={setting.setting_key} setting={setting} form={form} onResetToDefault={onResetToDefault} />
        ))}
      </div>
    </Card>
  );
}
