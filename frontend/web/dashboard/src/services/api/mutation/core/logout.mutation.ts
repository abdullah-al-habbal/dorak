import { z } from "zod";

import { browserStorage, clearStoredPushRegistration, readStoredPushRegistration } from "@/lib/push/web-push-token-storage.util";
import { API_ROUTE } from "@/config/routes.constant";
import { HttpMethod } from "@/enums/access/http-method.enum";
import { apiRequest } from "@/services/api/core/client";

const logoutResultSchema = z.object({ loggedOut: z.boolean() });

/** Signs out and stops pushes to this browser: the stored push token rides along so the backend revokes it. */
export async function logoutMutation(): Promise<void> {
  const storage = browserStorage();
  const pushToken = storage ? readStoredPushRegistration(storage)?.token : undefined;
  await apiRequest(API_ROUTE.logout, { method: HttpMethod.Post, body: pushToken ? { pushToken } : undefined, schema: logoutResultSchema, skipRefresh: true });
  // Only after success: a failed sign-out keeps the token, so it can still be revoked.
  if (storage) clearStoredPushRegistration(storage);
}
