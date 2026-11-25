import { z } from "zod";

import { WEB_PUSH_TOKEN_MAX_LENGTH } from "@/config/push/web-push.constant";

export const storedPushRegistrationSchema = z.object({
  token: z.string().min(1).max(WEB_PUSH_TOKEN_MAX_LENGTH),
  owner: z.string().min(1),
});
