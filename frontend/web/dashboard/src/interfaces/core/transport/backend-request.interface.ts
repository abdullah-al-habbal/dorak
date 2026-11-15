import type { HttpMethod } from "@/enums/access/http-method.enum";

export interface BackendRequest {
  path: string;
  method: HttpMethod;
  body?: unknown;
  accessToken?: string;
  claim?: string;
  locale?: string;
  /** The visitor's IP, forwarded so the backend's per-IP limits count visitors, not this server. */
  clientIp?: string;
}
