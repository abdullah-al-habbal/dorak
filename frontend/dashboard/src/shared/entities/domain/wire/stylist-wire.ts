import type { LocalizedStylistName } from '../types/localized-stylist-name';
import type { StylistStatus } from '../types/stylist-status';

/** Backend `BarberResource` contract. Snake case stays in this DTO. */
export interface StylistWire {
  readonly compatibility_score: number | null;
  readonly created_at: string | null;
  readonly distance: number | null;
  readonly email: string;
  readonly has_login: boolean;
  readonly id: string;
  readonly is_freelancer: boolean;
  readonly latitude: number | string | null;
  readonly longitude: number | string | null;
  readonly name: LocalizedStylistName;
  readonly phone: string | null;
  readonly rank: number | null;
  readonly status: StylistStatus;
  readonly travel_radius: number | string | null;
}
