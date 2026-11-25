import { z } from "zod";

export const pushTokenResultSchema = z.object({ id: z.string() });
export const pushTokenRevokedSchema = z.unknown();
