import type { LocalizedStylistName } from './localized-stylist-name';
import type { StylistStatus } from './stylist-status';

/** Dashboard stylist domain record. Wire names stay in `wire/stylist-wire.ts`. */
export interface Stylist {
  readonly email: string;
  readonly id: string;
  readonly name: LocalizedStylistName;
  readonly phone: string | null;
  readonly status: StylistStatus;
}
