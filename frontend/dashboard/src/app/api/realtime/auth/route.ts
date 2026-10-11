import { readSessionCookies } from "@/services/api/auth/cookies";
import { bearerHeaders } from "@/services/api/http.util";
import { apiFailure, noStore } from "@/services/api/response.util";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const token = readSessionCookies(request.cookies).accessToken;
  if (!token)
    return noStore(
      apiFailure(401, "session_expired", "Your session has expired."),
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
