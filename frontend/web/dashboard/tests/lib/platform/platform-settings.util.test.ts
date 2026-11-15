import { describe, expect, it } from "vitest";

import { SettingGroup } from "@/enums/setting-group.enum";
import { changedSettings, groupSettings, settingIssues, settingsToForm } from "@/lib/platform/platform-settings.util";
import { mapSettingsSaveError } from "@/lib/platform/platform-settings-error.util";
import { ApiClientError } from "@/services/api/core/api-client-error";
import type { PlatformSetting } from "@/types/platform/platform-setting.type";

const setting = (key: string, value: number, extra: Partial<PlatformSetting> = {}): PlatformSetting => ({
  setting_key: key,
  group: SettingGroup.Search,
  value_integer: value,
  default: value,
  min: 5,
  max: 500,
  ...extra,
});
const settings = [
  setting("pagination_default_per_page", 15),
  setting("pagination_max_per_page", 100),
  setting("dashboard_session_ttl_seconds", 1000, { group: SettingGroup.Auth, min: 900, max: 604800 }),
  setting("dashboard_refresh_ttl_seconds", 5000, { group: SettingGroup.Auth, min: 3600, max: 7776000 }),
];

describe("platform settings util", () => {
  it("turns settings into string form values", () => {
    expect(settingsToForm(settings).pagination_max_per_page).toBe("100");
  });

  it("sends only what changed", () => {
    const values = { ...settingsToForm(settings), pagination_max_per_page: "200" };
    expect(changedSettings(values, settings)).toEqual({ pagination_max_per_page: 200 });
    expect(changedSettings(settingsToForm(settings), settings)).toEqual({});
  });

  it("flags non-integers and out-of-range values", () => {
    const values = { ...settingsToForm(settings), pagination_default_per_page: "1.5", pagination_max_per_page: "9999" };
    expect(settingIssues(values, settings)).toEqual([
      { name: "pagination_default_per_page", kind: "integer" },
      { name: "pagination_max_per_page", kind: "range" },
    ]);
  });

  it("checks the cross-field rules only when every field is valid", () => {
    const base = settingsToForm(settings);
    expect(settingIssues({ ...base, pagination_default_per_page: "60", pagination_max_per_page: "50" }, settings)).toEqual([{ name: "pagination_default_per_page", kind: "pageSize" }]);
    expect(settingIssues({ ...base, dashboard_refresh_ttl_seconds: "4000", dashboard_session_ttl_seconds: "6000" }, settings)).toEqual([{ name: "dashboard_refresh_ttl_seconds", kind: "refreshTtl" }]);
    expect(settingIssues(base, settings)).toEqual([]);
  });

  it("groups settings", () => {
    expect(groupSettings(settings, SettingGroup.Auth)).toHaveLength(2);
  });

  it("maps backend field errors from settings.<key> to the bare key", () => {
    const error = new ApiClientError({ status: 422, code: "VALIDATION_ERROR", message: "invalid", fields: { "settings.pagination_default_per_page": ["Too big"] } });
    expect(mapSettingsSaveError(error, "generic").fieldErrors).toEqual({ pagination_default_per_page: "Too big" });
    expect(mapSettingsSaveError(new Error("x"), "generic").formError).toBe("generic");
  });

  it("keeps a backend field name without the settings prefix as it is", () => {
    const error = new ApiClientError({ status: 422, code: "VALIDATION_ERROR", message: "invalid", fields: { settings: ["Required"] } });
    expect(mapSettingsSaveError(error, "generic").fieldErrors).toEqual({ settings: "Required" });
  });
});
