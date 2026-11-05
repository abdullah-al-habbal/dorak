import { createContext } from "react";

import type { I18nContextValue } from "@/interfaces/i18n-context-value.interface";

export const I18nContext = createContext<I18nContextValue | null>(null);
