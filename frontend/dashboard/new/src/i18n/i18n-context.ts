"use client";

import { createContext } from "react";
import type { I18nState } from "@/i18n/i18n.types";

export const I18nContext = createContext<I18nState | null>(null);

I18nContext.displayName = "I18nContext";
