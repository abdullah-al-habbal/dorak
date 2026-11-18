import type { z } from "zod";

import type { createInviteBarberFormSchema } from "@/schemas/branches/invite-barber-form.zod";

export type InviteBarberFormValues = z.input<ReturnType<typeof createInviteBarberFormSchema>>;
