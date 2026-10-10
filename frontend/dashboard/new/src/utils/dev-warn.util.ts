/** Development-only diagnostics; silent in production builds. */
export function devWarn(message: string, details?: Record<string, unknown>): void {
  if (process.env.NODE_ENV !== "production") {
    console.warn(message, details);
  }
}
