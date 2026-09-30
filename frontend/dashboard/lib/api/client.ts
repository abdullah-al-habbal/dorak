const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, { credentials: 'include', ...init, headers: { Accept: 'application/json', ...init?.headers } });
  if (!response.ok) throw new Error(`API request failed: ${response.status}`);
  const body = await response.json() as { data: T };
  return body.data;
}
