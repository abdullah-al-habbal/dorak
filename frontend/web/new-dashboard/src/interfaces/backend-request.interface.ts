import type { HttpMethod } from "@/enums/http-method.enum";

export interface BackendRequest {
  path: string;
  method: HttpMethod;
  body?: unknown;
  accessToken?: string;
  claim?: string;
  locale?: string;
}
