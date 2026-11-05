import { ApiErrorCode } from "@/enums/api-error-code.enum";
import type { BackendResult } from "@/interfaces/backend-result.interface";

const HTTP_UNAUTHORIZED = 401;
const HTTP_FORBIDDEN = 403;
const HTTP_UNPROCESSABLE = 422;
const HTTP_TOO_MANY = 429;
const HTTP_SERVICE_UNAVAILABLE = 503;
const HTTP_BAD_GATEWAY = 502;
const HTTP_SERVER_ERROR = 500;
const BANNED_CODE = "ACCOUNT_BANNED";

export interface MappedFailure {
  status: number;
  code: ApiErrorCode;
  fields?: Record<string, string[]>;
}

export function mapBackendFailure(result: BackendResult): MappedFailure {
  if (result.failure === "transport") return { status: HTTP_SERVICE_UNAVAILABLE, code: ApiErrorCode.Network };
  if (result.failure !== "none") return { status: HTTP_BAD_GATEWAY, code: ApiErrorCode.Server };
  if (result.status === HTTP_UNAUTHORIZED) return { status: HTTP_UNAUTHORIZED, code: ApiErrorCode.InvalidCredentials };
  if (result.status === HTTP_FORBIDDEN && result.envelope?.code === BANNED_CODE) {
    return { status: HTTP_FORBIDDEN, code: ApiErrorCode.AccountBanned };
  }
  if (result.status === HTTP_FORBIDDEN) return { status: HTTP_FORBIDDEN, code: ApiErrorCode.Forbidden };
  if (result.status === HTTP_TOO_MANY) return { status: HTTP_TOO_MANY, code: ApiErrorCode.TooManyRequests };
  if (result.status === HTTP_UNPROCESSABLE) {
    return { status: 400, code: ApiErrorCode.InvalidRequest, fields: result.envelope?.errors };
  }
  return { status: HTTP_SERVER_ERROR, code: ApiErrorCode.Server };
}
