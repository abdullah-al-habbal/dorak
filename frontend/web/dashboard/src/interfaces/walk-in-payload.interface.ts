export interface WalkInPayload {
  branch_id: string;
  chair_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  service_ids: string[];
  /** UTC ISO-8601. */
  starts_at: string;
}
