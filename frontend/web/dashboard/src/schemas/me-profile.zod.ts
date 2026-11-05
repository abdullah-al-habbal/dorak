import { z } from "zod";

import { BackendActorType } from "@/enums/backend-actor-type.enum";
import { BackendRole } from "@/enums/backend-role.enum";

const idSchema = z.union([z.string(), z.number()]).transform(String);

export const meProfileSchema = z.object({
  id: idSchema,
  actor_type: z.enum(BackendActorType),
  role: z.enum(BackendRole),
  branch_id: idSchema.nullish().transform((v) => v ?? null),
  display_name: z.string().nullish().transform((v) => v ?? null),
  email: z.string().nullish().transform((v) => v ?? null),
  permissions: z.array(z.string()).default([]),
});
