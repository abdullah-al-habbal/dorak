import { RotateCcwIcon } from "lucide-react";
import type { JSX } from "react";
import { useWatch } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";

import { FormField, fieldErrorId } from "@/components/common/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/hooks/core/state/use-i18n";
import { warnUnknownKey } from "@/lib/core/format/enum-label.util";
import type { SettingFormValues } from "@/lib/platform/platform-settings.util";
import { formatCount } from "@/lib/earnings/earnings-format.util";
import type { PlatformSetting } from "@/types/platform/platform-setting.type";

interface PlatformSettingFieldProps {
  setting: PlatformSetting;
  form: UseFormReturn<SettingFormValues>;
  onResetToDefault: (setting: PlatformSetting) => void;
}

export function PlatformSettingField({ setting, form, onResetToDefault }: PlatformSettingFieldProps): JSX.Element {
  const { dictionary, locale } = useI18n();
  const { settings: t } = dictionary;
  const key = setting.setting_key;
  const id = `setting-${key}`;
  const copy: Partial<Record<string, { label: string; unit: string }>> = t.keys;
  const known = Object.hasOwn(copy, key);
  const label = known ? (copy[key]?.label ?? t.unknownSetting) : t.unknownSetting;
  if (!known) warnUnknownKey("platform-setting", key);
  const error = form.formState.errors[key]?.message;
  const atDefault = useWatch({ control: form.control, name: key }) === String(setting.default);
  const number = (value: number): string => formatCount(value, locale);

  return (
    <div className="flex flex-col gap-1.5">
      <FormField id={id} label={label} hint={copy[key]?.unit} error={error}>
        <div className="flex items-center gap-2">
          <Input id={id} dir="ltr" inputMode="numeric" autoComplete="off" aria-invalid={Boolean(error)} aria-describedby={error ? fieldErrorId(id) : `${id}-hint`} className="max-w-48" {...form.register(key)} />
          <Button type="button" variant="ghost" size="sm" disabled={atDefault} onClick={() => onResetToDefault(setting)} aria-label={t.field.resetLabel.replace("{setting}", label)}>
            <RotateCcwIcon aria-hidden data-icon="inline-start" />
            {t.field.reset}
          </Button>
        </div>
      </FormField>
      <p id={`${id}-hint`} className="tabular text-xs text-muted-foreground">
        {t.field.hint.replace("{default}", number(setting.default)).replace("{min}", number(setting.min)).replace("{max}", number(setting.max))}
        {known ? null : <span dir="ltr" translate="no" className="ms-2">{key}</span>}
      </p>
    </div>
  );
}
