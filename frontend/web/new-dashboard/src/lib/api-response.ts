import { NextResponse } from "next/server";

import type { ApiErrorCode } from "@/enums/api-error-code.enum";

const NO_STORE = { "Cache-Control": "no-store" };

export function apiSuccess(data: unknown, status = 200): NextResponse {
  return NextResponse.json({ success: true, message: "", data }, { status, headers: NO_STORE });
}

export function apiFailure(
  status: number,
  code: ApiErrorCode,
  message: string,
  fields?: Record<string, string[]>,
): NextResponse {
  return NextResponse.json(
    { success: false, message, error: { code, fields } },
    { status, headers: NO_STORE },
  );
}
