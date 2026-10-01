import { z } from 'zod';
import type { EntityField, EntityFieldTree, InferFieldTree } from './fields';

/** Builds the React Hook Form validation contract from an entity's field tree. */
export function buildEntitySchema<TFields extends EntityFieldTree>(
  fields: TFields,
): z.ZodType<InferFieldTree<TFields>> {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const [key, field] of Object.entries<EntityField>(fields)) {
    shape[key] = field.control === 'group' ? buildEntitySchema(field.fields) : field.schema;
  }

  return z.object(shape) as z.ZodType<InferFieldTree<TFields>>;
}
