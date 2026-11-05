import type { API_ERROR_CODE } from "@/services/api/core/error-code.constant";

export type ApiErrorCode = (typeof API_ERROR_CODE)[keyof typeof API_ERROR_CODE];
