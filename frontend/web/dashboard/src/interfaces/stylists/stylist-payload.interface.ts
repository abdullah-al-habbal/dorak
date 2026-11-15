export interface StylistPayload {
  name: { en: string; ar: string };
  email: string;
  phone?: string;
  /** Required when creating, omitted when editing. */
  password?: string;
  chair_id: string | null;
}
