import type { z } from "zod";

import type { createSpecialDayFormSchema } from "@/schemas/hours/special-day-form.zod";

export type SpecialDayFormValues = z.input<ReturnType<typeof createSpecialDayFormSchema>>;
