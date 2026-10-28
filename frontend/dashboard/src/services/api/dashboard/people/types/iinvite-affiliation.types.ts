import type { z } from "zod";
import type { inviteAffiliationFormSchema } from "@/services/api/dashboard/people/schemas/people.schema";

export type IInviteAffiliation = z.output<typeof inviteAffiliationFormSchema>;
