"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/core/use-dictionary";
import { useFeedbackMutation } from "@/hooks/core/use-feedback-mutation";
import { languageAdminKeys } from "@/lib/query-keys/platform/language-admin-keys";
import { setLanguageActive } from "@/services/api/mutation/platform/language-admin.mutation";
import type { AdminLanguage } from "@/types/platform/admin-language.type";

interface ActiveVariables {
  id: string;
  active: boolean;
}

export function useSetLanguageActive(): UseMutationResult<AdminLanguage, Error, ActiveVariables> {
  const { settings } = useDictionary();
  return useFeedbackMutation({
    mutationFn: ({ id, active }: ActiveVariables) => setLanguageActive(id, active),
    invalidate: [languageAdminKeys.all],
    successMessage: (_data, { active }) => (active ? settings.languages.toast.on : settings.languages.toast.off),
    errorMessage: () => settings.languages.toast.failed,
  });
}
