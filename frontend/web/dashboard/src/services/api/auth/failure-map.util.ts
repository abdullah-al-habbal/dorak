import { ApiErrorCode } from "@/enums/api-error-code.enum";
import { HttpStatus } from "@/enums/http-status.enum";
import type { BackendResult } from "@/interfaces/backend-result.interface";

const BANNED_CODE = "ACCOUNT_BANNED";

export interface MappedFailure {
  status: number;
  code: ApiErrorCode;
  fields?: Record<string, string[]>;
}

export function mapBackendFailure(result: BackendResult): MappedFailure {
  if (result.failure === "transport") return { status: HttpStatus.ServiceUnavailable, code: ApiErrorCode.Network };
  if (result.failure !== "none") return { status: HttpStatus.BadGateway, code: ApiErrorCode.Server };
  if (result.status === HttpStatus.Unauthorized) return { status: HttpStatus.Unauthorized, code: ApiErrorCode.InvalidCredentials };
  if (result.status === HttpStatus.Forbidden && result.envelope?.code === BANNED_CODE) {
    return { status: HttpStatus.Forbidden, code: ApiErrorCode.AccountBanned };
  }
  if (result.status === HttpStatus.Forbidden) return { status: HttpStatus.Forbidden, code: ApiErrorCode.Forbidden };
  if (result.status === HttpStatus.TooManyRequests) return { status: HttpStatus.TooManyRequests, code: ApiErrorCode.TooManyRequests };
  if (result.status === HttpStatus.Unprocessable) {
    return { status: HttpStatus.BadRequest, code: ApiErrorCode.InvalidRequest, fields: result.envelope?.errors };
  }
  return { status: HttpStatus.InternalServerError, code: ApiErrorCode.Server };
}
