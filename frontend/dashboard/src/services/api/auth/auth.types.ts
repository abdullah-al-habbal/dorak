import type {
  AUTH_ACTORS,
  OPERATIONS_ACTORS,
  BACKEND_ACTOR_TYPES,
  DASHBOARD_ROLES,
} from "@/services/api/auth/actors.constant";

export type AuthActor = (typeof AUTH_ACTORS)[number];

export type OperationsActor = (typeof OPERATIONS_ACTORS)[number];

export type BackendActorType = (typeof BACKEND_ACTOR_TYPES)[number];

export type DashboardRole = (typeof DASHBOARD_ROLES)[number];

export interface DashboardClaim {
  actor_type: BackendActorType;
  role: DashboardRole;
  sub: string;
  branch_id?: string;
  brand_id?: string;
  brand_ids?: string[];
  iat: number;
  exp: number;
  iss: string;
  jti: string;
}

export interface AuthSession {
  actor: AuthActor;
  actorType: BackendActorType;
  role: DashboardRole;
  subject: string;
  branchId: string | null;
  brandIds: string[];
  displayName: string | null;
  email: string | null;
  permissions: string[];
  claimExpiresAt: number;
}

export interface BackendLoginData {
  claim: string;
  expires_in: number;
  token: string;
  refresh_token: string;
  refresh_expires_in: number;
}

export interface BackendMeData {
  id: string;
  actor_type: BackendActorType;
  role: DashboardRole;
  branch_id: string | null;
  brand_id?: string | null;
  brand_ids?: string[];
  display_name: string | null;
  email: string | null;
  permissions: string[];
}

export interface ApiEnvelope<TData> {
  success: boolean;
  statusCode: number;
  code: string;
  message: string;
  timestamp: string;
  data?: TData;
  meta?: Record<string, unknown>;
  errors?: Record<string, string[]>;
}

export interface LoginCredentials {
  actor: AuthActor;
  email: string;
  password: string;
}

export interface LoginResponse {
  actor: AuthActor;
}

export type LogoutResponse = Record<string, never>;

export interface BackendResult<TData> {
  ok: boolean;
  status: number;
  envelope: ApiEnvelope<TData> | null;
  failure: "none" | "transport" | "redirect" | "invalid-response";
}

export interface SessionCookiePayload {
  claim: string;
  accessToken: string;
  refreshToken: string;
  claimMaxAgeSeconds: number;
  refreshMaxAgeSeconds: number;
}

export interface RefreshedSession {
  claim: DashboardClaim;
  cookies: SessionCookiePayload;
}
