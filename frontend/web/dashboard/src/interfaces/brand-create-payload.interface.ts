/** The body of `POST /brands` that the dashboard sends. */
export interface BrandCreatePayload {
  name: { en: string; ar: string };
  base_currency_code: string;
  first_branch: { name: { en: string; ar: string } };
}
