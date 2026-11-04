import { HttpMethod } from "@/enums/http-method.enum";
import { forwardDashboardRequest } from "@/services/api/proxy/forward";

type RouteContext = { params: Promise<{ path: string[] }> };

function handler(method: HttpMethod) {
  return async (request: Request, context: RouteContext) => {
    const { path } = await context.params;
    return forwardDashboardRequest(request, method, path);
  };
}

export const GET = handler(HttpMethod.Get);
export const POST = handler(HttpMethod.Post);
export const PUT = handler(HttpMethod.Put);
export const PATCH = handler(HttpMethod.Patch);
export const DELETE = handler(HttpMethod.Delete);
