import { z } from "zod";

import { Locale } from "@/enums/locale.enum";

export const localeSchema = z.enum(Locale);
