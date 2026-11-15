import { SettingKey } from "@/enums/setting-key.enum";
import type { PlatformSetting } from "@/types/platform/platform-setting.type";

export type SettingFormValues = Record<string, string>;
/** What the form reports while a field may still be unset. */
export type SettingInputValues = Readonly<Record<string, string | undefined>>;

export interface SettingIssue {
  name: string;
  kind: "range" | "integer" | "pageSize" | "refreshTtl";
}

export function settingsToForm(settings: readonly PlatformSetting[]): SettingFormValues {
  return Object.fromEntries(settings.map((setting) => [setting.setting_key, String(setting.value_integer)]));
}

function parseInteger(text: string): number | null {
  const trimmed = text.trim();
  if (!/^-?\d+$/.test(trimmed)) return null;
  return Number(trimmed);
}

/** Per-field bounds first; the cross-field rules run only when every field is valid, like the backend. */
export function settingIssues(values: SettingInputValues, settings: readonly PlatformSetting[]): SettingIssue[] {
  const issues: SettingIssue[] = [];
  for (const setting of settings) {
    const value = parseInteger(values[setting.setting_key] ?? "");
    if (value === null) issues.push({ name: setting.setting_key, kind: "integer" });
    else if (value < setting.min || value > setting.max) issues.push({ name: setting.setting_key, kind: "range" });
  }
  if (issues.length > 0) return issues;

  const number = (key: SettingKey): number => parseInteger(values[key] ?? "") ?? 0;
  if (number(SettingKey.PaginationDefaultPerPage) > number(SettingKey.PaginationMaxPerPage)) {
    issues.push({ name: SettingKey.PaginationDefaultPerPage, kind: "pageSize" });
  }
  if (number(SettingKey.DashboardRefreshTtlSeconds) < number(SettingKey.DashboardSessionTtlSeconds)) {
    issues.push({ name: SettingKey.DashboardRefreshTtlSeconds, kind: "refreshTtl" });
  }
  return issues;
}

/** Only what differs from the saved value; an empty object means there is nothing to save. */
export function changedSettings(values: SettingInputValues, settings: readonly PlatformSetting[]): Record<string, number> {
  const changed: Record<string, number> = {};
  for (const setting of settings) {
    const value = parseInteger(values[setting.setting_key] ?? "");
    if (value !== null && value !== setting.value_integer) changed[setting.setting_key] = value;
  }
  return changed;
}

export function groupSettings(settings: readonly PlatformSetting[], group: PlatformSetting["group"]): PlatformSetting[] {
  return settings.filter((setting) => setting.group === group);
}
