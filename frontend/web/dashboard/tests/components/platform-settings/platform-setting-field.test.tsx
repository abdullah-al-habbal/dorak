// @vitest-environment jsdom
import "@tests/helpers/dom.helper";

import { render, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";

import { PlatformSettingField } from "@/components/platform-settings/platform-setting-field";
import { I18nProvider } from "@/components/providers/i18n-provider";
import { LOCALE_DIRECTION } from "@/config/locales.constant";
import { Locale } from "@/enums/access/locale.enum";
import { DICTIONARIES } from "@/locales/dictionaries.constant";

function Harness({ settingKey, locale }: { settingKey: string; locale: Locale }) {
  const form = useForm({ defaultValues: { [settingKey]: "5" } });
  const setting = { setting_key: settingKey, value: 5, default: 5, min: 1, max: 10 } as never;
  return (
    <I18nProvider value={{ locale, direction: LOCALE_DIRECTION[locale], dictionary: DICTIONARIES[locale] }}>
      <PlatformSettingField setting={setting} form={form as never} onResetToDefault={() => undefined} />
    </I18nProvider>
  );
}

describe("PlatformSettingField", () => {
  it("labels a known setting with its dictionary text", () => {
    render(<Harness settingKey="pagination_default_per_page" locale={Locale.En} />);
    expect(screen.getByRole("textbox", { name: new RegExp(DICTIONARIES[Locale.En].settings.keys.pagination_default_per_page.label) })).toBeInTheDocument();
  });

  it("shows Unknown setting as the label and the key as a ltr hint, in both languages", () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    for (const locale of [Locale.En, Locale.Ar]) {
      const view = render(<Harness settingKey="brand_new_limit" locale={locale} />);
      expect(screen.getByLabelText(DICTIONARIES[locale].settings.unknownSetting)).toBeInTheDocument();
      const key = screen.getByText("brand_new_limit");
      expect(key).toHaveAttribute("dir", "ltr");
      expect(key).toHaveAttribute("translate", "no");
      view.unmount();
    }
  });
});
