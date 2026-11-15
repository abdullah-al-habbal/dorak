import { z } from "zod";

import { BackendActorType } from "@/enums/access/backend-actor-type.enum";
import { BackendRole } from "@/enums/access/backend-role.enum";

const idSchema = z.union([z.string(), z.number()]).transform(String);

export const meProfileSchema = z.object({
  id: idSchema,
  actor_type: z.enum(BackendActorType),
  role: z.enum(BackendRole),
  branch_id: idSchema.nullish().transform((v) => v ?? null),
  brand_id: idSchema.nullish(),
  brand_ids: z.array(idSchema).optional(),
  display_name: z.string().nullish().transform((v) => v ?? null),
  email: z.string().nullish().transform((v) => v ?? null),
  permissions: z.array(z.string()).default([]),
});
