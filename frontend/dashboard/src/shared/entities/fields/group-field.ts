import type { EntityFieldTree } from './entity-field';

export type GroupField<TChildren extends EntityFieldTree> = {
  readonly control: 'group';
  readonly fields: TChildren;
  readonly form?: boolean;
  readonly label?: string;
  readonly list?: false;
  readonly show?: boolean;
};
