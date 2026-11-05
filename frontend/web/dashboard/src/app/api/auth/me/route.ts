import { ApiErrorCode } from "@/enums/api-error-code.enum";
import { apiFailure, apiSuccess } from "@/lib/api-response";
import { getRequestDictionary } from "@/locales/get-request-dictionary";
import { getServerSession } from "@/services/api/auth/server-session";

const HTTP_UNAUTHORIZED = 401;

export async function GET(request: Request) {
  const session = await getServerSession();
  if (!session) {
    return apiFailure(HTTP_UNAUTHORIZED, ApiErrorCode.SessionExpired, getRequestDictionary(request).errors.api.session_expired);
  }
  return apiSuccess(session);
}
