export type ApiFailureKind =
  | "offline"
  | "unreachable"
  | "timeout"
  | "aborted"
  | "redirect"
  | "invalid-response"
  | "http";
