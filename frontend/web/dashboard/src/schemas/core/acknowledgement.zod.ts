import { z } from "zod";

/** A BFF reply that only confirms the action, such as `{ requested: true }`. */
export const acknowledgementSchema = z.record(z.string(), z.literal(true));
