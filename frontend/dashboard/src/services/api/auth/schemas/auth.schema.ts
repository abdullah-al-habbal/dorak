import { z } from "zod";
import {
  AUTH_ACTORS,
  BACKEND_ACTOR_TYPES,
  DASHBOARD_ROLES,
} from "@/services/api/auth/actors.constant";

export const DashboardClaimSchema = z.object({
  actor_type: z.enum(BACKEND_ACTOR_TYPES),
  role: z.enum(DASHBOARD_ROLES),
  sub: z.string(),
  branch_id: z.string().optional(),
  brand_id: z.string().optional(),
  brand_ids: z.array(z.string()).optional(),
  iat: z.number(),
  exp: z.number(),
  iss: z.string(),
  jti: z.string(),
});

export const AuthSessionSchema = z.object({
  actor: z.enum(AUTH_ACTORS),
  actorType: z.enum(BACKEND_ACTOR_TYPES),
  role: z.enum(DASHBOARD_ROLES),
  subject: z.string(),
  branchId: z.string().nullable(),
  brandId: z.string().nullable(),
  brandIds: z.array(z.string()),
  displayName: z.string().nullable(),
  email: z.string().nullable(),
  permissions: z.array(z.string()),
  claimExpiresAt: z.number(),
});

export const BackendLoginDataSchema = z.object({
  claim: z.string(),
  expires_in: z.number(),
  token: z.string(),
  refresh_token: z.string(),
  refresh_expires_in: z.number(),
});

export const BackendMeDataSchema = z.object({
  id: z.string(),
  actor_type: z.enum(BACKEND_ACTOR_TYPES),
  role: z.enum(DASHBOARD_ROLES),
  branch_id: z.string().nullable(),
  brand_id: z.string().nullable().optional(),
  brand_ids: z.array(z.string()).optional(),
  display_name: z.string().nullable(),
  email: z.string().nullable(),
  permissions: z.array(z.string()),
});

export const ApiEnvelopeSchema = z.object({
  success: z.boolean(),
  statusCode: z.number(),
  code: z.string(),
  message: z.string(),
  timestamp: z.string(),
  data: z.unknown().optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
  errors: z.record(z.string(), z.array(z.string())).optional(),
});

export const LoginCredentialsSchema = z.object({
  actor: z.enum(AUTH_ACTORS),
  email: z.string().email(),
  password: z.string(),
});

export const LoginResponseSchema = z.object({
  actor: z.enum(AUTH_ACTORS),
});

export const LogoutResponseSchema = z.object({});

export const SessionCookiePayloadSchema = z.object({
  claim: z.string(),
  accessToken: z.string(),
  refreshToken: z.string(),
  claimMaxAgeSeconds: z.number(),
  refreshMaxAgeSeconds: z.number(),
});

export const RefreshedSessionSchema = z.object({
  claim: DashboardClaimSchema,
  cookies: SessionCookiePayloadSchema,
});
