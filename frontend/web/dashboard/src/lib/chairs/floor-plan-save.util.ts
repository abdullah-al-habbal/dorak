import type { ChairPayload } from "@/interfaces/chairs/chair-payload.interface";
import type { ChairLayoutPayload } from "@/interfaces/chairs/chair-payload.interface";
import { chairToForm, formToChairPayload } from "@/lib/chairs/chair-form.util";
import type { Chair } from "@/types/chairs/chair.type";

/** The full chair body the update route needs, with the new placement and nothing else changed. */
export function chairPayloadWithLayout(chair: Chair, branchId: string, layout: ChairLayoutPayload): ChairPayload {
  return { ...formToChairPayload(chairToForm(chair, branchId), chair), layout_settings: layout };
}
