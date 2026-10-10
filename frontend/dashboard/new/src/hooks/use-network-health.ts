"use client";

import { useSyncExternalStore } from "react";
import { getNetworkHealth, subscribeNetworkHealth } from "@/services/api/network-health";
import { INITIAL_NETWORK_HEALTH } from "@/services/api/network-health.constant";
import type { NetworkHealth } from "@/services/api/network-health.types";

export function useNetworkHealth(): NetworkHealth {
  return useSyncExternalStore(subscribeNetworkHealth, getNetworkHealth, () => INITIAL_NETWORK_HEALTH);
}
