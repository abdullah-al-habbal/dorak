import { createContext } from "react";

import type { I18nContextValue } from "@/interfaces/ui/i18n-context-value.interface";

export const I18nContext = createContext<I18nContextValue | null>(null);
