import type { z } from "zod";

import type { barberApprovalSchema } from "@/schemas/stylists/barber-approval.zod";

export type BarberApproval = z.infer<typeof barberApprovalSchema>;
