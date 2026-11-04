import { z } from "zod";

import { ThemeMode } from "@/enums/theme-mode.enum";

export const themeModeSchema = z.enum(ThemeMode);
