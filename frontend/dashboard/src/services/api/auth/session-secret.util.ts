/** Key ring for dashboard claims; legacy single secret remains kid=default. */
export function getSessionSecrets(): Record<string, string> {
  const secrets: Record<string, string> = {};
  const raw = process.env.DASHBOARD_SESSION_SECRETS;
  if (raw) {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (
        typeof parsed === "object" &&
        parsed !== null &&
        !Array.isArray(parsed)
      ) {
        for (const [kid, secret] of Object.entries(parsed)) {
          if (typeof secret === "string" && secret.length >= 32)
            secrets[kid] = secret;
        }
      }
    } catch {
      for (const pair of raw.split(",")) {
        const separator = pair.indexOf(":");
        if (separator > 0) {
          const kid = pair.slice(0, separator).trim();
          const secret = pair.slice(separator + 1).trim();
          if (secret.length >= 32) secrets[kid] = secret;
        }
      }
    }
  }

  const fallback = process.env.DASHBOARD_SESSION_SECRET;
  if (fallback && fallback.length >= 32) secrets.default ??= fallback;

  return secrets;
}
