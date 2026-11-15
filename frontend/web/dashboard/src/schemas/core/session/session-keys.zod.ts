import { z } from "zod";

import { MIN_SECRET_LENGTH } from "@/config/backend.constant";

export const sessionKeyRingSchema = z.record(z.string().min(1), z.string().min(MIN_SECRET_LENGTH));
