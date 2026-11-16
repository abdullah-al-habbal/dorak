import type { FloorZone } from "@/enums/people/floor-zone.enum";
import type { ChairLayoutPayload, ChairPayload } from "@/interfaces/chairs/chair-payload.interface";
import { chairToForm, formToChairPayload } from "@/lib/chairs/chair-form.util";
import type { Chair } from "@/types/chairs/chair.type";

/** The full chair body the update route needs, with the new placement (and zone, when it changed) and nothing else changed. */
export function chairPayloadWithLayout(chair: Chair, branchId: string, layout: ChairLayoutPayload, zone?: FloorZone): ChairPayload {
  const body = formToChairPayload(chairToForm(chair, branchId), chair);
  return { ...body, ...(zone === undefined ? {} : { floor_zone: zone }), layout_settings: layout };
}
