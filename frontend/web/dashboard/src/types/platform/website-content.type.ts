import type { z } from "zod";

import type { contentPageSchema, contentSectionSchema, onboardingConfigSchema, testimonialSchema, websiteContentSchema } from "@/schemas/platform/website-content.zod";

export type ContentSection = z.infer<typeof contentSectionSchema>;
export type ContentPage = z.infer<typeof contentPageSchema>;
export type Testimonial = z.infer<typeof testimonialSchema>;
export type WebsiteContent = z.infer<typeof websiteContentSchema>;
export type OnboardingConfig = z.infer<typeof onboardingConfigSchema>;
