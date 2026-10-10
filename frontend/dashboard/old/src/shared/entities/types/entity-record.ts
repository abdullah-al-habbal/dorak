import type { EntityId } from './entity-id';

/** Minimum shape every entity record must satisfy. */
export interface EntityRecord {
  readonly id: EntityId;
}
