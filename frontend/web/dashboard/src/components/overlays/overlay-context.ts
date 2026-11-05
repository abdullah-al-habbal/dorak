import { createContext } from "react";

import type { OverlayContextValue } from "@/interfaces/overlay-context-value.interface";

export const OverlayContext = createContext<OverlayContextValue | null>(null);
