import { z } from "zod";

import { DASHBOARD_API } from "@/config/routes.constant";
import { HttpMethod } from "@/enums/http-method.enum";
import type { UniverseVisibility } from "@/enums/universe-visibility.enum";
import { contentPageSchema, contentSectionSchema, onboardingConfigSchema, testimonialSchema } from "@/schemas/platform/website-content.zod";
import { apiRequest } from "@/services/api/core/client";
import type { ContentPage, ContentSection, OnboardingConfig, Testimonial } from "@/types/platform/website-content.type";

interface Pair {
  en: string;
  ar: string;
}

export interface PagePayload {
  title: Pair;
  meta_description: Pair;
}

export interface SectionPayload {
  title: Pair;
  subtitle: Pair;
  body: { en: Record<string, unknown>; ar: Record<string, unknown> };
  media_url: string | null;
  sort_order: number;
  universe_visibility: UniverseVisibility;
}

export interface TestimonialPayload {
  section_id: string | null;
  author_name: string;
  author_title: Pair;
  body: Pair;
  avatar_url: string | null;
  rating: number;
  sort_order: number;
}

export interface OnboardingPayload {
  is_active: boolean;
  sort_order: number;
}

const ADMIN = `${DASHBOARD_API}/admin`;

export function updateContentPage(id: string, payload: PagePayload): Promise<ContentPage> {
  return apiRequest(`${ADMIN}/marketing-pages/${encodeURIComponent(id)}`, { method: HttpMethod.Put, body: payload, schema: contentPageSchema });
}

export function updateContentSection(id: string, payload: SectionPayload): Promise<ContentSection> {
  return apiRequest(`${ADMIN}/marketing-sections/${encodeURIComponent(id)}`, { method: HttpMethod.Put, body: payload, schema: contentSectionSchema });
}

export function createTestimonial(payload: TestimonialPayload): Promise<Testimonial> {
  return apiRequest(`${ADMIN}/testimonials`, { method: HttpMethod.Post, body: payload, schema: testimonialSchema });
}

export function updateTestimonial(id: string, payload: TestimonialPayload): Promise<Testimonial> {
  return apiRequest(`${ADMIN}/testimonials/${encodeURIComponent(id)}`, { method: HttpMethod.Put, body: payload, schema: testimonialSchema });
}

export async function deleteTestimonial(id: string): Promise<void> {
  await apiRequest(`${ADMIN}/testimonials/${encodeURIComponent(id)}`, { method: HttpMethod.Delete, schema: z.unknown() });
}

export function updateOnboardingConfig(id: string, payload: OnboardingPayload): Promise<OnboardingConfig> {
  return apiRequest(`${ADMIN}/onboarding-configs/${encodeURIComponent(id)}`, { method: HttpMethod.Put, body: payload, schema: onboardingConfigSchema });
}
