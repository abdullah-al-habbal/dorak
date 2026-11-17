import type { z } from "zod";

import type { createPageFormSchema, createSectionFormSchema, createTestimonialFormSchema } from "@/schemas/platform/content/website-content-form.zod";

export type PageFormValues = z.input<ReturnType<typeof createPageFormSchema>>;
export type SectionFormValues = z.input<ReturnType<typeof createSectionFormSchema>>;
export type TestimonialFormValues = z.input<ReturnType<typeof createTestimonialFormSchema>>;
