export type BackendHealth =
  | "unknown"
  | "available"
  | "degraded"
  | "unavailable";

export interface NetworkHealth {
  online: boolean;
  backend: BackendHealth;
}
