import { SettingGroup } from "@/enums/ui/setting-group.enum";

/** The order the groups appear on the screen. */
export const SETTING_GROUP_ORDER: readonly SettingGroup[] = [
  SettingGroup.Auth,
  SettingGroup.Booking,
  SettingGroup.Billing,
  SettingGroup.Search,
  SettingGroup.Media,
  SettingGroup.FloorPlan,
];
export const SETTINGS_ROOT_ERROR_PREFIX = "settings.";
