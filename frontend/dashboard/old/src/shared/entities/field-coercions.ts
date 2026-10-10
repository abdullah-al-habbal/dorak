import { z } from 'zod';

/**
 * A cleared text input submits `''`, an unset optional number arrives from the
 * API as `null`, and an untouched field is absent from the payload entirely.
 * All three mean "no value" and must not fail a required-value schema.
 */
function blankToUndefined(value: unknown): unknown {
  return value === '' || value === null || value === undefined ? undefined : value;
}

export function optionalNumber(schema: z.ZodNumber) {
  return z.preprocess(blankToUndefined, schema.optional());
}

export function optionalUuid() {
  return z.preprocess(blankToUndefined, z.string().uuid().nullable().optional());
}
