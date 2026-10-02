/** Dashboard stylist domain record. Wire names stay in `stylist-wire.ts`. */
export type StylistStatus = 'disabled' | 'enabled' | 'pending';

export interface LocalizedStylistName {
  readonly ar: string;
  readonly en: string;
}

export interface Stylist {
  readonly email: string;
  readonly id: string;
  readonly name: LocalizedStylistName;
  readonly phone: string | null;
  readonly status: StylistStatus;
}
