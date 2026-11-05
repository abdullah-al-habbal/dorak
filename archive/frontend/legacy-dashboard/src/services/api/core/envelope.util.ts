import type {
  ApiFailure,
  ApiResponse,
  ApiSuccess,
} from "@/services/api/core/types/envelope.types";
import { hasFieldTypes } from "@/utils/guards.util";

export function successResponse<TData>(
  data: TData,
  message = "",
): ApiSuccess<TData> {
  return { success: true, data, message };
}

export function failureResponse(
  code: string,
  message: string,
  fields?: Record<string, string[]>,
): ApiFailure {
  return { success: false, error: { code, fields }, message };
}

export function isApiResponse(value: unknown): value is ApiResponse<unknown> {
  return (
    hasFieldTypes(value, { success: "boolean", message: "string" }) &&
    (value.success ? "data" in value : typeof value.error === "object")
  );
}
