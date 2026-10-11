import { NextResponse } from "next/server";
import type { ApiFailure, ApiSuccess } from "@/services/api/envelope.types";
import { failureResponse, successResponse } from "@/services/api/envelope.util";

export function apiSuccess<TData>(data: TData, status = 200, message = "") {
  return NextResponse.json<ApiSuccess<TData>>(successResponse(data, message), {
    status,
  });
}

/** Mark a BFF response as uncacheable. */
export function noStore<TResponse extends Response>(
  response: TResponse,
): TResponse {
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export function apiFailure(
  status: number,
  code: string,
  message: string,
  fields?: Record<string, string[]>,
) {
  return NextResponse.json<ApiFailure>(failureResponse(code, message, fields), {
    status,
  });
}
