import { z } from "zod";

import { BackendActorType } from "@/enums/access/backend-actor-type.enum";
import { BackendRole } from "@/enums/access/backend-role.enum";

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
  /** Id of the backend access token this claim is bound to. A claim without it is a legacy claim and is rejected, which sends the session through the refresh token. */
  tid: z.string().min(1),
});
