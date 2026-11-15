"use client";

import type { JSX } from "react";

import { AccountSection } from "@/components/account/account-section";
import { FormField } from "@/components/common/form-field";
import { NativeSelect } from "@/components/ui/native-select";
import { LOCALES, LOCALE_LABEL } from "@/config/locales.constant";
import { useAccountSettings } from "@/hooks/account/use-account-settings";
import { useDictionary } from "@/hooks/core/state/use-dictionary";
import { useI18n } from "@/hooks/core/state/use-i18n";
import { useLanguagePreference } from "@/hooks/account/use-language-preference";
import { localeSchema } from "@/schemas/core/api/locale.zod";

/** The account's language. Saved on the backend so emails follow it, then applied to this dashboard. */
export function LanguageSection(): JSX.Element {
  const { account, common } = useDictionary();
  const { locale } = useI18n();
  const settings = useAccountSettings();
  const { choose, pending } = useLanguagePreference();
  const value = settings.data?.preferred_language ?? locale;

  return (
    <AccountSection id="language" title={account.language.title} description={account.language.description}>
      <div className="sm:max-w-xs">
        <FormField id="account-language" label={common.language}>
          <NativeSelect
            id="account-language"
            value={value}
            disabled={pending || settings.isPending}
            aria-busy={pending}
            onChange={(event) => {
              const next = localeSchema.safeParse(event.target.value);
              if (next.success && next.data !== value) choose(next.data);
            }}
          >
            {LOCALES.map((item) => (
              <option key={item} value={item} lang={item}>{LOCALE_LABEL[item]}</option>
            ))}
          </NativeSelect>
        </FormField>
      </div>
    </AccountSection>
  );
}
