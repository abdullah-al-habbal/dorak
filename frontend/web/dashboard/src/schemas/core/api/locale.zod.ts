import { z } from "zod";

import { Locale } from "@/enums/access/locale.enum";

export const localeSchema = z.enum(Locale);
