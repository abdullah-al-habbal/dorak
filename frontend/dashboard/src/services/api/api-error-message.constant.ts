import type { ApiErrorCopyKey } from "@/services/api/api-error-message.types";

/** HTTP statuses with dedicated copy; unlisted 5xx map to `server`, everything else to `unexpected`. */
export const API_ERROR_STATUS_COPY: Readonly<
  Partial<Record<number, ApiErrorCopyKey>>
> = {
  0: "network",
  400: "validation",
  401: "unauthorized",
  403: "forbidden",
  404: "notFound",
  422: "validation",
};
