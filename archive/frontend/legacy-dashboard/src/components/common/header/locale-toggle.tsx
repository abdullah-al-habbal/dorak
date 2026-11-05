"use client";

import { HeaderControlButton } from "@/components/common/header/header-control-button";
import { useLocaleToggle } from "@/hooks/use-locale-toggle";

export function LocaleToggle() {
  const localeToggle = useLocaleToggle();

  return (
    <HeaderControlButton
      ariaLabel={localeToggle.ariaLabel}
      onPress={localeToggle.toggleLocale}
    >
      <span className="text-xs font-semibold">
        {localeToggle.currentLocale.toUpperCase()}
      </span>
    </HeaderControlButton>
  );
}
