import type { ApiFailureKind } from "@/services/api/client-error.types";

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly errors?: Record<string, string[]>,
    public readonly kind: ApiFailureKind = "http",
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}
