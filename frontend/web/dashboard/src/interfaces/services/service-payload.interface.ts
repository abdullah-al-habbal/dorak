export interface ServicePayload {
  serviceable_id: string;
  serviceable_type: string;
  catalog_item_id: string | null;
  /** Omitted when only a flag changes, so the stored category stays as it is. */
  category_id?: string | null;
  currency_code: string;
  name: { en: string; ar: string };
  /** Minor units (cents). */
  price_amount_minor: number;
  duration_minutes: number | null;
  is_active: boolean;
  is_at_home: boolean;
}
