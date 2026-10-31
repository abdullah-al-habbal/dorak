import { describe, expect, it } from "vitest";
import {
  buildPlatformSettingsFormSchema,
  platformSettingsFormDefaults,
  platformSettingsPayload,
} from "@/services/api/dashboard/settings/settings.util";
import type { IPlatformSetting } from "@/services/api/dashboard/settings/types/iplatform-setting.types";

const SETTINGS: IPlatformSetting[] = [
  {
    key: "pagination_max_per_page",
    group: "search",
    value: 100,
    default: 100,
    min: 10,
    max: 500,
  },
  {
    key: "face_profile_max_photos",
    group: "media",
    value: 5,
    default: 5,
    min: 1,
    max: 20,
  },
];

describe("platform settings form helpers", () => {
  it("defaults each field to the current value as text", () => {
    expect(platformSettingsFormDefaults(SETTINGS)).toEqual({
      pagination_max_per_page: "100",
      face_profile_max_photos: "5",
    });
  });

  it("accepts values inside the reported range and rejects the rest", () => {
    const schema = buildPlatformSettingsFormSchema(SETTINGS);
    expect(
      schema.safeParse({
        pagination_max_per_page: "500",
        face_profile_max_photos: "1",
      }).success,
    ).toBe(true);
    expect(
      schema.safeParse({
        pagination_max_per_page: "501",
        face_profile_max_photos: "1",
      }).success,
    ).toBe(false);
    expect(
      schema.safeParse({
        pagination_max_per_page: "100",
        face_profile_max_photos: "many",
      }).success,
    ).toBe(false);
  });

  it("sends only the settings that changed", () => {
    expect(
      platformSettingsPayload(
        { pagination_max_per_page: "100", face_profile_max_photos: "8" },
        SETTINGS,
      ),
    ).toEqual({ settings: { face_profile_max_photos: 8 } });
  });
});
