import { ApiErrorCode } from "@/enums/api-error-code.enum";
import { HttpStatus } from "@/enums/http-status.enum";
import { apiFailure, apiSuccess } from "@/lib/api-response";
import { getRequestDictionary } from "@/locales/get-request-dictionary";
import { getServerSession } from "@/services/api/auth/server-session";


export async function GET(request: Request) {
  const session = await getServerSession();
  if (!session) {
    return apiFailure(HttpStatus.Unauthorized, ApiErrorCode.SessionExpired, getRequestDictionary(request).errors.api.session_expired);
  }
  return apiSuccess(session);
}
