import { cookies } from "next/headers";

import { BACKEND_PATH } from "@/config/backend.constant";
import { ACCESS_COOKIE, CLAIM_COOKIE, REFRESH_COOKIE } from "@/config/cookies.constant";
import { HttpMethod } from "@/enums/http-method.enum";
import { apiSuccess } from "@/lib/api-response";
import { backendRequest } from "@/services/api/auth/backend-client";
import { clientIpFromHeaders } from "@/services/api/auth/client-ip.util";
import { clearSessionCookies } from "@/services/api/auth/cookies";

export async function POST(request: Request) {
  const store = await cookies();
  const accessToken = store.get(ACCESS_COOKIE)?.value;
  if (accessToken) {
    await backendRequest({
      path: BACKEND_PATH.logout,
      method: HttpMethod.Post,
      accessToken,
      claim: store.get(CLAIM_COOKIE)?.value,
      body: { claim: store.get(CLAIM_COOKIE)?.value, refresh_token: store.get(REFRESH_COOKIE)?.value },
      clientIp: clientIpFromHeaders(request.headers),
    });
  }
  const response = apiSuccess({ loggedOut: true });
  clearSessionCookies(response);
  return response;
}
