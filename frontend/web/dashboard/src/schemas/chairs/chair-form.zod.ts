import { z } from "zod";

import { CHAIR_MAX_LABEL } from "@/config/venue/chair-layout.constant";
import { ChairStatus } from "@/enums/venue/chair-status.enum";
import { FloorZone } from "@/enums/people/floor-zone.enum";
import type { Dictionary } from "@/types/core/shared/dictionary.type";

type ChairValidation = Dictionary["chairs"]["form"]["validation"];

/** Messages come from the dictionary so validation reads in the active locale. */
export function createChairSchema(messages: ChairValidation) {
  return z.object({
    label: z.string().trim().min(1, messages.label).max(CHAIR_MAX_LABEL, messages.label),
    floor_zone: z.enum(FloorZone, messages.zone),
    status: z.enum(ChairStatus, messages.status),
    branch_id: z.string().min(1, messages.branch),
  });
}

export type ChairFormValues = z.input<ReturnType<typeof createChairSchema>>;
