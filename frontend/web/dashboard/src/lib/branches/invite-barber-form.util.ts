import { createFieldNameMapper } from "@/lib/core/errors/apply-form-error.util";
import type { InviteBarberFormValues } from "@/types/branches/invite-barber-form-values.type";
import type { InviteBarberRequest } from "@/types/branches/invite-barber-request.type";

/** A blank commission is left out so the branch default applies. */
export function formToInviteRequest(values: InviteBarberFormValues): InviteBarberRequest {
  const commission = values.commission.trim();
  const commissionPart = commission === "" ? {} : { commission_percent: Number(commission) };
  if (values.barber_id !== "") return { kind: "barber", payload: { barber_id: values.barber_id, ...commissionPart } };
  return { kind: "contact", payload: { contact: values.term.trim(), ...commissionPart } };
}

export const mapInviteFieldName = createFieldNameMapper({ barber_id: "barber_id", contact: "barber_id", commission_percent: "commission" });
