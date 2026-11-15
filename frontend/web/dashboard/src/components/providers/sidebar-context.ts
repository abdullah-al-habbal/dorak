import { createContext } from "react";

import type { SidebarContextValue } from "@/interfaces/ui/shell/sidebar-context-value.interface";

export const SidebarContext = createContext<SidebarContextValue | null>(null);
