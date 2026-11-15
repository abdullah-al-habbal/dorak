import { z } from "zod";

import { DASHBOARD_API } from "@/config/routes.constant";
import { HttpMethod } from "@/enums/access/http-method.enum";
import { branchInvitationSchema } from "@/schemas/branches/branch-oversight.zod";
import { apiRequest } from "@/services/api/core/client";
import type { BranchInvitation } from "@/types/branches/branch-invitation.type";

export interface InviteBarberPayload {
  barber_id: string;
  commission_percent?: number;
}

function affiliationsPath(branchId: string): string {
  return `${DASHBOARD_API}/branches/${encodeURIComponent(branchId)}/affiliations`;
}

export function inviteBarber(branchId: string, payload: InviteBarberPayload): Promise<BranchInvitation> {
  return apiRequest(affiliationsPath(branchId), { method: HttpMethod.Post, body: payload, schema: branchInvitationSchema });
}

export interface InviteBarberByContactPayload {
  contact: string;
  commission_percent?: number;
}

/** The answer is the same whether or not anyone matched, so there is nothing to parse. */
export function inviteBarberByContact(branchId: string, payload: InviteBarberByContactPayload): Promise<unknown> {
  return apiRequest(`${affiliationsPath(branchId)}/by-contact`, { method: HttpMethod.Post, body: payload, schema: z.unknown() });
}

export type InvitationAction = "accept" | "reject" | "terminate";

export function actOnInvitation(branchId: string, id: string, action: InvitationAction): Promise<BranchInvitation> {
  return apiRequest(`${affiliationsPath(branchId)}/${encodeURIComponent(id)}/${action}`, { method: HttpMethod.Post, schema: branchInvitationSchema });
}
