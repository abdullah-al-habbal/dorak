import { ROUTES } from "@/config/routes.constant";
import type { ApiClientError } from "@/services/api/client-error";
import { isServiceUnavailableError } from "@/services/api/client-error.util";
import { isApiResponse } from "@/services/api/envelope.util";
import { isRedirectResponse, readJson } from "@/services/api/http.util";
import {
  HEALTH_POLL_INTERVAL_MS,
  HEALTH_PROBE_TIMEOUT_MS,
  INITIAL_NETWORK_HEALTH,
} from "@/services/api/network-health.constant";
import type { NetworkHealth } from "@/services/api/network-health.types";
import { devWarn } from "@/utils/dev-warn.util";
import { createEmitter } from "@/utils/emitter.util";

let current = INITIAL_NETWORK_HEALTH;
let activeProbe: AbortController | null = null;
const changes = createEmitter();

function publish(next: NetworkHealth): void {
  if (next.online === current.online && next.backend === current.backend) return;
  current = next;
  changes.emit();
}

function browserOnline(): boolean {
  return typeof navigator === "undefined" || navigator.onLine;
}

function documentVisible(): boolean {
  return typeof document === "undefined" || document.visibilityState !== "hidden";
}

function isAvailableHealthPayload(payload: unknown): boolean {
  return (
    isApiResponse(payload) &&
    payload.success &&
    typeof payload.data === "object" &&
    payload.data !== null &&
    "backend" in payload.data &&
    payload.data.backend === "available"
  );
}

export function canPollHealth(): boolean {
  return browserOnline() && documentVisible();
}

export async function checkBackendHealth(): Promise<void> {
  if (typeof window === "undefined" || !canPollHealth() || activeProbe !== null) return;

  const controller = new AbortController();
  activeProbe = controller;
  const timeout = window.setTimeout(() => controller.abort(), HEALTH_PROBE_TIMEOUT_MS);

  try {
    const response = await fetch(ROUTES.api.health, {
      cache: "no-store",
      credentials: "omit",
      redirect: "manual",
      signal: controller.signal,
    });
    const payload = await readJson(response);

    if (isRedirectResponse(response)) {
      devWarn("Unexpected healthcheck redirect.", { status: response.status });
      publish({ online: true, backend: "degraded" });
    } else if (response.status >= 400 && response.status < 500) {
      devWarn("Healthcheck client error.", { status: response.status });
      publish({ online: true, backend: "degraded" });
    } else if (!response.ok) {
      publish({ online: true, backend: "unavailable" });
    } else if (isAvailableHealthPayload(payload)) {
      publish({ online: true, backend: "available" });
    } else {
      devWarn("Invalid or degraded healthcheck response.");
      publish({ online: true, backend: "degraded" });
    }
  } catch {
    publish({ online: browserOnline(), backend: browserOnline() ? "unavailable" : "unknown" });
  } finally {
    window.clearTimeout(timeout);
    if (activeProbe === controller) activeProbe = null;
  }
}

export function reportApiFailure(error: ApiClientError | null): void {
  if (typeof window === "undefined") return;
  if (error === null) return publish({ online: browserOnline(), backend: "available" });
  if (error.kind === "offline") return publish({ online: false, backend: "unknown" });
  publish({ online: browserOnline(), backend: isServiceUnavailableError(error) ? "unavailable" : "available" });
}

export const subscribeNetworkHealth = changes.subscribe;

export function getNetworkHealth(): NetworkHealth {
  return current;
}

export function startNetworkHealthMonitoring(): () => void {
  const sync = () => {
    if (!browserOnline()) publish({ online: false, backend: "unknown" });
    if (canPollHealth()) void checkBackendHealth();
  };
  const onVisibilityChange = () => {
    if (documentVisible() && browserOnline()) void checkBackendHealth();
  };
  const poll = () => {
    if (canPollHealth()) void checkBackendHealth();
  };

  window.addEventListener("online", sync);
  window.addEventListener("offline", sync);
  document.addEventListener("visibilitychange", onVisibilityChange);
  sync();
  const interval = window.setInterval(poll, HEALTH_POLL_INTERVAL_MS);

  return () => {
    window.removeEventListener("online", sync);
    window.removeEventListener("offline", sync);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    window.clearInterval(interval);
    activeProbe?.abort();
    activeProbe = null;
  };
}
