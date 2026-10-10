import type { LocalizedStylistName } from '../types/localized-stylist-name';
import type { StylistStatus } from '../types/stylist-status';

export type StylistPayloadWire = {
  readonly chair_id?: string;
  readonly email: string;
  readonly name: LocalizedStylistName;
  readonly password?: string;
  readonly phone: string | null;
  readonly status?: StylistStatus;
};
