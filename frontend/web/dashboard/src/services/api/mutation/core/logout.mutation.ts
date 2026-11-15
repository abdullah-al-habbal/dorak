import { z } from "zod";

import { API_ROUTE } from "@/config/routes.constant";
import { HttpMethod } from "@/enums/http-method.enum";
import { apiRequest } from "@/services/api/core/client";

const logoutResultSchema = z.object({ loggedOut: z.boolean() });

export async function logoutMutation(): Promise<void> {
  await apiRequest(API_ROUTE.logout, { method: HttpMethod.Post, schema: logoutResultSchema, skipRefresh: true });
}
