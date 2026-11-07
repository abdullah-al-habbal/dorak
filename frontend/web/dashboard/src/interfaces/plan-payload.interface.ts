/** The body of `POST|PUT /admin/subscription-plans`; mirrors `SavePlanRequest`. */
export interface PlanPayload {
  name: { en: string; ar: string };
  description: { en: string | null; ar: string | null };
  price_amount_minor: number;
  currency_code: string;
  interval_unit: string;
  interval_count: number;
  is_active: boolean;
  sort_order: number;
  feature_keys: string[];
}
