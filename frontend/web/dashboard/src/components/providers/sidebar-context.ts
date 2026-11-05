import { createContext } from "react";

import type { SidebarContextValue } from "@/interfaces/sidebar-context-value.interface";

export const SidebarContext = createContext<SidebarContextValue | null>(null);
