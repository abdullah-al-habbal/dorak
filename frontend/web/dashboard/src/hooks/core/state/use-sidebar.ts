"use client";

import { useContext } from "react";

import { SidebarContext } from "@/components/providers/sidebar-context";
import type { SidebarContextValue } from "@/interfaces/ui/shell/sidebar-context-value.interface";

export function useSidebar(): SidebarContextValue {
  const value = useContext(SidebarContext);
  if (!value) throw new Error("useSidebar must be used inside <SidebarProvider>.");
  return value;
}
