import type { z } from "zod";

import type { hoursOverrideInputSchema, hoursOverrideRangeInputSchema, hoursOverrideSchema } from "@/schemas/hours/hours-override.zod";

export type HoursOverride = z.infer<typeof hoursOverrideSchema>;
export type HoursOverrideInput = z.infer<typeof hoursOverrideInputSchema>;
export type HoursOverrideRangeInput = z.infer<typeof hoursOverrideRangeInputSchema>;
