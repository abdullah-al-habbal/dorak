"use client";

import { LanguagesIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LOCALES, LOCALE_LABEL } from "@/config/locales.constant";
import { useI18n } from "@/hooks/use-i18n";
import { useLocaleSwitch } from "@/hooks/use-locale-switch";
import { localeSchema } from "@/schemas/locale.zod";

export function LanguageToggle() {
  const { locale, dictionary } = useI18n();
  const { switchTo, pending } = useLocaleSwitch();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon" aria-label={dictionary.common.language} disabled={pending} />}
      >
        <LanguagesIcon aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        <DropdownMenuRadioGroup
          value={locale}
          onValueChange={(value) => {
            const next = localeSchema.safeParse(value);
            if (next.success) switchTo(next.data);
          }}
        >
          {LOCALES.map((item) => (
            <DropdownMenuRadioItem key={item} value={item} lang={item}>{LOCALE_LABEL[item]}</DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
