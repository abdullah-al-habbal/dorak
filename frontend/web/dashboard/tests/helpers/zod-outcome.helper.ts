import type { z } from "zod";

export interface ZodOutcome {
  success: boolean;
  data: unknown;
  /** Distinct messages: what a form shows does not depend on how many issues repeat one message. */
  messages: string[];
}

/** Reduces a parse to what a form observes, so a builder can be compared with the inline schema it replaced. */
export function zodOutcome(schema: z.ZodType, input: unknown): ZodOutcome {
  const result = schema.safeParse(input);
  if (result.success) return { success: true, data: result.data, messages: [] };
  return { success: false, data: undefined, messages: [...new Set(result.error.issues.map((issue) => issue.message))].sort() };
}
