"use client";

import type { Locale } from "@/enums/access/locale.enum";
import { useDictionary } from "@/hooks/core/state/use-dictionary";
import { useFeedbackMutation } from "@/hooks/core/query/use-feedback-mutation";
import { useLocaleSwitch } from "@/hooks/core/state/use-locale-switch";
import { accountKeys } from "@/lib/query-keys/account/account-keys";
import { updatePreferredLanguage } from "@/services/api/mutation/account/account.mutation";

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
