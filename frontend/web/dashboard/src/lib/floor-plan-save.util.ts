import type { ChairPayload } from "@/interfaces/chair-payload.interface";
import type { ChairLayoutPayload } from "@/interfaces/chair-payload.interface";
import { chairToForm, formToChairPayload } from "@/lib/chair-form.util";
import type { Chair } from "@/types/chair.type";

/** The full chair body the update route needs, with the new placement and nothing else changed. */
export function chairPayloadWithLayout(chair: Chair, branchId: string, layout: ChairLayoutPayload): ChairPayload {
  return { ...formToChairPayload(chairToForm(chair, branchId), chair), layout_settings: layout };
}
