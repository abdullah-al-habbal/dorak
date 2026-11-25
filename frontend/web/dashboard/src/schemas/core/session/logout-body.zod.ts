import { z } from "zod";

import { WEB_PUSH_TOKEN_MAX_LENGTH } from "@/config/push/web-push.constant";

/** The sign-out call may carry this browser's push token so the backend stops pushing to it. */
export const logoutBodySchema = z.object({ pushToken: z.string().min(1).max(WEB_PUSH_TOKEN_MAX_LENGTH).optional() });
