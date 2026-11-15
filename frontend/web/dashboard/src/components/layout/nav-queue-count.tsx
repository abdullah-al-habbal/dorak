"use client";

import type { JSX } from "react";

import { usePendingBarberCount } from "@/hooks/stylists/use-pending-barber-count";
import type { NavKey } from "@/types/ui/nav-key.type";

function PendingBarberCount(): JSX.Element | null {
  const count = usePendingBarberCount();
  return count > 0 ? <span className="tabular ms-auto rounded-full bg-warning/15 px-2 py-0.5 text-[11px] font-medium">{count}</span> : null;
}

/** The size of a review queue next to its menu entry. Only queue entries render a count. */
export function NavQueueCount({ itemKey }: { itemKey: NavKey }): JSX.Element | null {
  return itemKey === "barberApprovals" ? <PendingBarberCount /> : null;
}
