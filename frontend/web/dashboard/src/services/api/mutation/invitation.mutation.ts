import { DASHBOARD_API } from "@/config/routes.constant";
import { HttpMethod } from "@/enums/http-method.enum";
import { branchInvitationSchema } from "@/schemas/branch-oversight.zod";
import { apiRequest } from "@/services/api/core/client";
import type { BranchInvitation } from "@/types/branch-invitation.type";

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

export type InvitationAction = "accept" | "reject" | "terminate";

export function actOnInvitation(branchId: string, id: string, action: InvitationAction): Promise<BranchInvitation> {
  return apiRequest(`${affiliationsPath(branchId)}/${encodeURIComponent(id)}/${action}`, { method: HttpMethod.Post, schema: branchInvitationSchema });
}
