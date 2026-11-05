import type { LucideIcon } from "lucide-react";

import type { NavKey } from "@/types/nav-key.type";

export interface NavItem {
  key: NavKey;
  /** Path below the portal root; empty string is the portal root itself. */
  segment: string;
  icon: LucideIcon;
  /** Pages that don't exist yet render disabled with a "Soon" tag. */
  ready: boolean;
}
