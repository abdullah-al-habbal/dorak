/** The body of `PUT /brands/{id}` that the dashboard sends. */
export interface BrandUpdatePayload {
  name: { en: string; ar: string };
  description: { en: string | null; ar: string | null };
}
