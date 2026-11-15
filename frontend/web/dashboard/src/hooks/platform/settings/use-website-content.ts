"use client";

import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";

import { useDeleteMutation } from "@/hooks/core/query/use-delete-mutation";
import { useDictionary } from "@/hooks/core/state/use-dictionary";
import { useFeedbackMutation } from "@/hooks/core/query/use-feedback-mutation";
import { useListQuery } from "@/hooks/core/query/use-list-query";
import { useSaveMutation } from "@/hooks/core/query/use-save-mutation";
import type { SaveVariables } from "@/interfaces/core/query/save-variables.interface";
import { websiteContentKeys } from "@/lib/query-keys/platform/website-content-keys";
import {
  createTestimonial,
  deleteTestimonial,
  updateContentPage,
  updateContentSection,
  updateOnboardingConfig,
  updateTestimonial,
} from "@/services/api/mutation/platform/website-content.mutation";
import type { OnboardingPayload, PagePayload, SectionPayload, TestimonialPayload } from "@/services/api/mutation/platform/website-content.mutation";
import { fetchOnboardingConfigs, fetchWebsiteContent } from "@/services/api/query/platform/website-content.query";
import type { ContentPage, ContentSection, OnboardingConfig, Testimonial, WebsiteContent } from "@/types/platform/website-content.type";

interface UpdateVariables<P> {
  id: string;
  payload: P;
}

export function useWebsiteContent(): UseQueryResult<WebsiteContent> {
  return useListQuery(websiteContentKeys.content, fetchWebsiteContent);
}

export function useOnboardingConfigs(): UseQueryResult<OnboardingConfig[]> {
  return useListQuery(websiteContentKeys.onboarding, fetchOnboardingConfigs);
}

/** The dialogs show failures inline, so these mutations only toast success. */
export function useUpdateContentPage(): UseMutationResult<ContentPage, Error, UpdateVariables<PagePayload>> {
  const { content } = useDictionary();
  return useFeedbackMutation({
    mutationFn: ({ id, payload }: UpdateVariables<PagePayload>) => updateContentPage(id, payload),
    invalidate: [websiteContentKeys.all],
    successMessage: () => content.toast.pageSaved,
  });
}

export function useUpdateContentSection(): UseMutationResult<ContentSection, Error, UpdateVariables<SectionPayload>> {
  const { content } = useDictionary();
  return useFeedbackMutation({
    mutationFn: ({ id, payload }: UpdateVariables<SectionPayload>) => updateContentSection(id, payload),
    invalidate: [websiteContentKeys.all],
    successMessage: () => content.toast.sectionSaved,
  });
}

export function useSaveTestimonial(): UseMutationResult<Testimonial, Error, SaveVariables<TestimonialPayload>> {
  const { content } = useDictionary();
  return useSaveMutation({ create: createTestimonial, update: updateTestimonial, invalidate: [websiteContentKeys.all], messages: content.toast });
}

export function useDeleteTestimonial(): UseMutationResult<void, Error, string> {
  const { content } = useDictionary();
  return useDeleteMutation({ remove: deleteTestimonial, invalidate: [websiteContentKeys.all], messages: content.toast, surfaceConflict: false });
}

export function useUpdateOnboardingConfig(): UseMutationResult<OnboardingConfig, Error, UpdateVariables<OnboardingPayload>> {
  const { content } = useDictionary();
  return useFeedbackMutation({
    mutationFn: ({ id, payload }: UpdateVariables<OnboardingPayload>) => updateOnboardingConfig(id, payload),
    invalidate: [websiteContentKeys.all],
    successMessage: () => content.toast.onboardingSaved,
    errorMessage: () => content.toast.onboardingFailed,
  });
}
