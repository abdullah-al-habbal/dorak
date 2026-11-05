import { readSessionCookies } from "@/services/api/auth/cookies";
import { authorizeBroadcastChannel } from "@/services/api/common/realtime/realtime-auth.proxy";
import { API_ERROR_CODE } from "@/services/api/core/error-code.constant";
import { apiFailure, noStore } from "@/services/api/core/response.util";
import { getRequestDictionary } from "@/i18n/request-dictionary.util";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const copy = getRequestDictionary(request).common.apiError;
  const token = readSessionCookies(request.cookies).accessToken;
  if (!token)
    return noStore(
      apiFailure(401, API_ERROR_CODE.SESSION_EXPIRED, copy.unauthorized),
    );
  const result = await authorizeBroadcastChannel(token, await request.text());
  return new NextResponse(result.body, {
    status: result.status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}
