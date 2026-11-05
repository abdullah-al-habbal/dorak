import { z } from "zod";

import { BackendActorType } from "@/enums/backend-actor-type.enum";
import { BackendRole } from "@/enums/backend-role.enum";

export const sessionClaimSchema = z.object({
  actor_type: z.enum(BackendActorType),
  role: z.enum(BackendRole),
  sub: z.union([z.string(), z.number()]).transform(String),
  branch_id: z.union([z.string(), z.number()]).nullish().transform((v) => (v == null ? null : String(v))),
  brand_id: z.union([z.string(), z.number()]).nullish().transform((v) => (v == null ? null : String(v))),
  brand_ids: z.array(z.union([z.string(), z.number()]).transform(String)).optional(),
  iat: z.number().int(),
  exp: z.number().int(),
  iss: z.string(),
  jti: z.string().min(1),
});
