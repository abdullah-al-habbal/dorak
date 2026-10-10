"use client";

import { useNetworkHealth } from "@/hooks/use-network-health";
import { useDictionary } from "@/hooks/use-dictionary";

/** Translated banner copy for the current connectivity state, or null when healthy. */
export function useNetworkHealthMessage(): string | null {
  const { online, backend } = useNetworkHealth();
  const copy = useDictionary().common.apiError;

  if (!online) return copy.offline;
  if (backend === "unavailable") return copy.server;
  return null;
}
