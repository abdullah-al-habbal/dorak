import { z } from "zod";

export const chairFormSchema = z.object({
  label: z.string().min(1).max(120),
  branchId: z.string().uuid(),
  barberId: z.string().uuid().nullable(),
  floorZone: z.enum(["men", "women", "shared"]),
  status: z.enum(["available", "occupied", "maintenance"]),
  positionX: z.coerce.number().finite(),
  positionY: z.coerce.number().finite(),
  width: z.coerce.number().positive(),
  height: z.coerce.number().positive(),
  rotation: z.coerce.number().finite().nullable(),
});
