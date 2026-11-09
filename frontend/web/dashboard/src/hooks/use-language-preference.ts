"use client";

import type { Locale } from "@/enums/locale.enum";
import { useDictionary } from "@/hooks/use-dictionary";
import { useFeedbackMutation } from "@/hooks/use-feedback-mutation";
import { useLocaleSwitch } from "@/hooks/use-locale-switch";
import { accountKeys } from "@/lib/account-keys";
import { updatePreferredLanguage } from "@/services/api/mutation/account.mutation";

interface LanguagePreference {
  choose: (locale: Locale) => void;
  pending: boolean;
}

/** Saves the language on the account (emails follow it), then switches this dashboard to it. */
export function useLanguagePreference(): LanguagePreference {
  const { account } = useDictionary();
  const { switchTo, pending: switching } = useLocaleSwitch();
  const mutation = useFeedbackMutation({
    mutationFn: updatePreferredLanguage,
    invalidate: [accountKeys.settings],
    successMessage: () => account.language.saved,
    errorMessage: () => account.language.failed,
  });
  const { mutate } = mutation;

  const choose = (locale: Locale) => mutate(locale, { onSuccess: () => switchTo(locale) });

  return { choose, pending: mutation.isPending || switching };
}
