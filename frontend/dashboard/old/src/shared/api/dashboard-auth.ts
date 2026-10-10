type DashboardActorType = 'admin' | 'branch';

export type DashboardLoginCredentials = {
  readonly actorType: DashboardActorType;
  readonly email: string;
  readonly password: string;
};

type DashboardLoginPayload = {
  readonly claim: string;
  readonly expires_in: number;
  readonly token: string;
};

type DashboardLoginEnvelope = {
  readonly data?: DashboardLoginPayload;
  readonly message?: string;
  readonly success?: boolean;
};

const defaultApiUrl = 'http://localhost:8000/api/v1';

export async function requestDashboardLogin(
  credentials: DashboardLoginCredentials,
): Promise<Response> {
  return fetch(`${dashboardApiBaseUrl()}/dashboard/login`, {
    body: JSON.stringify({
      actor_type: credentials.actorType,
      email: credentials.email,
      password: credentials.password,
    }),
    cache: 'no-store',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    method: 'POST',
  });
}

export async function readDashboardLoginPayload(
  response: Response,
): Promise<DashboardLoginPayload | null> {
  const payload = (await response.json().catch(() => null)) as DashboardLoginEnvelope | null;
  if (!response.ok || payload?.success !== true || !isDashboardLoginPayload(payload.data)) {
    return null;
  }

  return payload.data;
}

export async function forwardDashboardRequest(
  request: Request,
  path: string,
  token: string,
): Promise<Response> {
  const requestUrl = new URL(request.url);
  const body = await request.arrayBuffer();
  const headers = new Headers({
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  });
  const acceptLanguage = request.headers.get('accept-language');
  const contentType = request.headers.get('content-type');
  if (acceptLanguage !== null) {
    headers.set('Accept-Language', acceptLanguage);
  }
  if (contentType !== null) {
    headers.set('Content-Type', contentType);
  }

  return fetch(`${dashboardApiBaseUrl()}${path}${requestUrl.search}`, {
    ...(body.byteLength === 0 ? {} : { body }),
    cache: 'no-store',
    headers,
    method: request.method,
  });
}

function dashboardApiBaseUrl(): string {
  return (
    process.env['DASHBOARD_API_URL'] ??
    process.env['NEXT_PUBLIC_API_URL'] ??
    defaultApiUrl
  ).replace(/\/$/, '');
}

function isDashboardLoginPayload(
  value: DashboardLoginPayload | undefined,
): value is DashboardLoginPayload {
  return (
    typeof value?.claim === 'string' &&
    typeof value.expires_in === 'number' &&
    Number.isInteger(value.expires_in) &&
    value.expires_in >= 60 &&
    typeof value.token === 'string'
  );
}
