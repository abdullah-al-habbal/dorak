import type { InviteBarberByContactPayload, InviteBarberPayload } from "@/services/api/mutation/branches/invitation.mutation";

/** A chosen barber is invited by id; an exact email or phone is invited by contact. */
export type InviteBarberRequest = { kind: "barber"; payload: InviteBarberPayload } | { kind: "contact"; payload: InviteBarberByContactPayload };
