import type { ApiErrorShape } from "@/interfaces/core/query/api-error-shape.interface";

export class ApiClientError extends Error {
  readonly status: number;
  readonly code: string;
  readonly requestId?: string;
  readonly fields?: Record<string, string[]>;

  constructor(shape: ApiErrorShape) {
    super(shape.message);
    this.name = "ApiClientError";
    this.status = shape.status;
    this.code = shape.code;
    this.requestId = shape.requestId;
    this.fields = shape.fields;
  }
}
