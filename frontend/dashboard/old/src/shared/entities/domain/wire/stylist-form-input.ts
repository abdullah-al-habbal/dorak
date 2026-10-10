import type { LocalizedStylistName } from '../types/localized-stylist-name';
import type { StylistStatus } from '../types/stylist-status';

export interface StylistFormInput {
  readonly chairId: string | null | undefined;
  readonly email: string;
  readonly name: LocalizedStylistName;
  readonly password: string | undefined;
  readonly phone: string | null | undefined;
  readonly status: StylistStatus | undefined;
}
