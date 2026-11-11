export const CONTENT_TEXT_MAX = 255;
export const CONTENT_META_MAX = 500;
export const TESTIMONIAL_BODY_MAX = 1000;
export const AUTHOR_NAME_MAX = 120;
export const CONTENT_SORT_MAX = 100000;
export const SECTION_BODY_MAX_BYTES = 20000;
export const RATING_VALUES = [1, 2, 3, 4, 5] as const;
export type ContentView = "pages" | "testimonials" | "onboarding";
