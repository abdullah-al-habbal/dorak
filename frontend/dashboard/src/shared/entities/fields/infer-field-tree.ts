import type { z } from 'zod';
import type { BaseField } from './base-field';
import type { EntityFieldTree } from './entity-field';
import type { GroupField } from './group-field';

export type InferFieldTree<TFields extends EntityFieldTree> = {
  [TKey in keyof TFields]: TFields[TKey] extends GroupField<infer TChildren>
    ? InferFieldTree<TChildren>
    : TFields[TKey] extends BaseField<infer TSchema>
      ? z.infer<TSchema>
      : never;
};
