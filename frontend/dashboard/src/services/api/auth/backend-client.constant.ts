export const BACKEND_CLIENT_TIMEOUT_MS = 15_000;

export const BACKEND_CLIENT_ENVELOPE_FIELDS = {
  success: "boolean",
  statusCode: "number",
  code: "string",
  message: "string",
  timestamp: "string",
} as const;
