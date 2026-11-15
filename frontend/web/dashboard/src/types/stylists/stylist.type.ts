import type { z } from "zod";

import type { stylistSchema } from "@/schemas/stylists/stylist.zod";

export type Stylist = z.infer<typeof stylistSchema>;
