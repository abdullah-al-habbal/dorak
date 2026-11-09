import { API_ROUTE } from "@/config/routes.constant";
import { ApiErrorCode } from "@/enums/api-error-code.enum";
import { HttpMethod } from "@/enums/http-method.enum";
import { HttpStatus } from "@/enums/http-status.enum";
import type { ApiRequestOptions } from "@/interfaces/api-request-options.interface";
import { apiFailureBodySchema } from "@/schemas/api-failure-body.zod";
import { apiSuccessBodySchema } from "@/schemas/api-success-body.zod";
import { ApiClientError } from "@/services/api/core/api-client-error";
import { reportSessionExpired } from "@/services/api/core/session-expiry.util";

let inflightRefresh: Promise<boolean> | null = null;

async function send(path: string, method: HttpMethod, body: unknown): Promise<Response> {
  try {
    return await fetch(path, {
      method,
      credentials: "same-origin",
      redirect: "manual",
      headers: { Accept: "application/json", ...(body === undefined ? {} : { "Content-Type": "application/json" }) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiClientError({ status: 0, code: ApiErrorCode.Network, message: "" });
  }
}

async function refreshOnce(): Promise<boolean> {
  inflightRefresh ??= send(API_ROUTE.refresh, HttpMethod.Post, undefined)
    .then((response) => response.ok)
    .catch(() => false)
    .finally(() => {
      inflightRefresh = null;
    });
  return inflightRefresh;
}

async function readBody(response: Response): Promise<unknown> {
  return response.json().catch(() => null);
}

function toError(status: number, body: unknown): ApiClientError {
  const failure = apiFailureBodySchema.safeParse(body);
  if (failure.success) {
    return new ApiClientError({ status, code: failure.data.error.code, message: failure.data.message, requestId: failure.data.request_id, fields: failure.data.error.fields });
  }
  return new ApiClientError({ status, code: ApiErrorCode.Server, message: "" });
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions<T>): Promise<T> {
  return (await apiRequestWithMeta(path, options)).data;
}

export async function apiRequestWithMeta<T>(
  path: string,
  options: ApiRequestOptions<T>,
): Promise<{ data: T; meta: unknown }> {
  const method = options.method ?? HttpMethod.Get;
  let response = await send(path, method, options.body);

  if (response.status === HttpStatus.Unauthorized && !options.skipRefresh && (await refreshOnce())) {
    response = await send(path, method, options.body);
  }
  const body = await readBody(response);
  if (response.status === HttpStatus.Unauthorized && !options.skipRefresh) reportSessionExpired();
  if (!response.ok) throw toError(response.status, body);

  const success = apiSuccessBodySchema.safeParse(body);
  const data = success.success ? options.schema.safeParse(success.data.data) : null;
  if (!success.success || !data?.success) throw new ApiClientError({ status: response.status, code: ApiErrorCode.Server, message: "" });
  return { data: data.data, meta: success.data.meta };
}
