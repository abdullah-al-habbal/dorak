import type { NetworkHealth } from "@/services/api/network-health.types";

export const INITIAL_NETWORK_HEALTH: NetworkHealth = {
  online: true,
  backend: "unknown",
};

export const HEALTH_PROBE_TIMEOUT_MS = 10_000;

export const HEALTH_POLL_INTERVAL_MS = 30_000;
