import { z } from "zod";

import { ThemeMode } from "@/enums/ui/theme-mode.enum";

export const themeModeSchema = z.enum(ThemeMode);
