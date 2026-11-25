import type { z } from "zod";

import type { storedPushRegistrationSchema } from "@/schemas/push/stored-push-registration.zod";

/** What this browser remembers about its push registration: the token and the account that registered it. */
export type StoredPushRegistration = z.infer<typeof storedPushRegistrationSchema>;
