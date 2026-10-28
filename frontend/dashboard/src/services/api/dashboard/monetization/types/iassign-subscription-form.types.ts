import type { z } from "zod";
import type { assignSubscriptionFormSchema } from "@/services/api/dashboard/monetization/schemas/monetization.schema";

export type IAssignSubscriptionForm = z.output<
  typeof assignSubscriptionFormSchema
>;
