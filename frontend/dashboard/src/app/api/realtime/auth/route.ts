import { readSessionCookies } from "@/services/api/auth/cookies";
import { bearerHeaders } from "@/services/api/core/http.util";
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
  const response = await fetch(
    `${(process.env.BACKEND_API_URL ?? "http://localhost:8000").replace(/\/+$/, "")}/api/v1/broadcasting/auth`,
    {
      method: "POST",
      headers: bearerHeaders(token),
      body: await request.text(),
      cache: "no-store",
    },
  );
  return new NextResponse(await response.text(), {
    status: response.status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}
