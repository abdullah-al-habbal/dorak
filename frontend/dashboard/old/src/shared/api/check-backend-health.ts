export type BackendHealth = 'online' | 'offline';

const defaultApiUrl = 'http://localhost:8000/api/v1';
const healthPath = '/health';
const healthRevalidateSeconds = 30;
const healthTimeoutMilliseconds = 3_000;

/**
 * Probes the public Laravel health endpoint without making landing-page
 * rendering depend on the backend being available.
 */
export async function checkBackendHealth(): Promise<BackendHealth> {
  try {
    const response = await fetch(healthUrl(), {
      next: { revalidate: healthRevalidateSeconds },
      signal: AbortSignal.timeout(healthTimeoutMilliseconds),
    });

    return response.ok ? 'online' : 'offline';
  } catch {
    return 'offline';
  }
}

function healthUrl(): string {
  const apiUrl = process.env['NEXT_PUBLIC_API_URL'] ?? defaultApiUrl;

  return `${apiUrl.replace(/\/$/, '')}${healthPath}`;
}
