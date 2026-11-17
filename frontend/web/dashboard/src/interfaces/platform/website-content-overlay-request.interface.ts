import type { OverlayKind } from "@/enums/ui/overlay-kind.enum";
import type { TestimonialSectionOption } from "@/types/platform/testimonial-section-option.type";
import type { ContentPage, ContentSection, Testimonial } from "@/types/platform/website-content.type";

export interface ContentPageOverlayRequest {
  kind: OverlayKind.ContentPageForm;
  page: ContentPage;
}

export interface ContentSectionOverlayRequest {
  kind: OverlayKind.ContentSectionForm;
  section: ContentSection;
}

export interface TestimonialOverlayRequest {
  kind: OverlayKind.TestimonialForm;
  /** Present when editing. */
  testimonial?: Testimonial;
  /** The sections a testimonial can be shown in. */
  sections: readonly TestimonialSectionOption[];
}
