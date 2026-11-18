import { z } from "zod";

import { ChairStatus } from "@/enums/venue/chair-status.enum";
import { FloorZone } from "@/enums/people/floor-zone.enum";
import { localizedTextSchema } from "@/schemas/core/api/localized-text.zod";

export const chairOptionSchema = z.object({
  id: z.string(),
  label: z.string().nullable().optional(),
  branch_id: z.string().nullable().optional(),
});

export const chairOptionListSchema = z.array(chairOptionSchema);

const chairLayoutSchema = z.object({
  position_x: z.number().optional().default(0),
  position_y: z.number().optional().default(0),
  width: z.number().optional().default(60),
  height: z.number().optional().default(60),
  rotation: z.number().nullable().optional(),
  shape: z.string().nullable().optional(),
});

export const chairSchema = z.object({
  id: z.string(),
  label: z.string().nullable().optional(),
  /** Live availability: `occupied` while a booking is in progress. */
  status: z.enum(ChairStatus).nullable().optional(),
  /** The stored status; the one an edit writes back. */
  configured_status: z.enum(ChairStatus).nullable().optional(),
  floor_zone: z.enum(FloorZone).nullable().optional(),
  layout_settings: chairLayoutSchema.nullable().optional(),
  branch_id: z.string().nullable().optional(),
  barber: z.object({ id: z.string(), name: localizedTextSchema.nullable().optional() }).nullable().optional(),
});

export const chairListSchema = z.array(chairSchema);
