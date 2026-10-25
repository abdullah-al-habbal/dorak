import { z } from "zod";
import type {
  AuthActor,
  OperationsActor,
  BackendActorType,
  DashboardRole,
} from "@/services/api/auth/actors.types";
import {
  DashboardClaimSchema,
  AuthSessionSchema,
  BackendLoginDataSchema,
  BackendMeDataSchema,
  ApiEnvelopeSchema,
  LoginCredentialsSchema,
  LoginResponseSchema,
  LogoutResponseSchema,
  SessionCookiePayloadSchema,
  RefreshedSessionSchema,
} from "@/services/api/auth/schema/auth.schema";

export type { AuthActor, OperationsActor, BackendActorType, DashboardRole };

export type DashboardClaim = z.infer<typeof DashboardClaimSchema>;

export type AuthSession = z.infer<typeof AuthSessionSchema>;

export type BackendLoginData = z.infer<typeof BackendLoginDataSchema>;

export type BackendMeData = z.infer<typeof BackendMeDataSchema>;

export type ApiEnvelope<TData> = z.infer<typeof ApiEnvelopeSchema> & {
  data?: TData;
};

export type LoginCredentials = z.infer<typeof LoginCredentialsSchema>;

export type LoginResponse = z.infer<typeof LoginResponseSchema>;

export type LogoutResponse = z.infer<typeof LogoutResponseSchema>;

export type SessionCookiePayload = z.infer<typeof SessionCookiePayloadSchema>;

export type RefreshedSession = z.infer<typeof RefreshedSessionSchema>;

export type BackendResult<TData> = {
  ok: boolean;
  status: number;
  envelope: ApiEnvelope<TData> | null;
  failure: "none" | "transport" | "redirect" | "invalid-response";
};
