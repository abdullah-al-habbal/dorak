import type { z } from "zod";

import type { barberApprovalSchema } from "@/schemas/barber-approval.zod";

export type BarberApproval = z.infer<typeof barberApprovalSchema>;
