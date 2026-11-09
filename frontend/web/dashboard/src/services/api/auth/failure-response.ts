import type { NextResponse } from "next/server";

import { apiFailure } from "@/lib/api-response";
import type { BackendResult } from "@/interfaces/backend-result.interface";
import { mapBackendFailure } from "@/services/api/auth/failure-map.util";
import type { Dictionary } from "@/types/dictionary.type";

export function failureFromBackend(result: BackendResult, dictionary: Dictionary): NextResponse {
  const mapped = mapBackendFailure(result);
  return apiFailure(mapped.status, mapped.code, dictionary.errors.api[mapped.code], mapped.fields, result.envelope?.request_id);
}
