import { NextResponse } from 'next/server';
import {
  requestDashboardLogin,
  readDashboardLoginPayload,
  type DashboardLoginCredentials,
} from '@/shared/api/dashboard-auth';
import { clearDashboardSession, setDashboardSession } from '@/shared/auth/dashboard-session';
import { homePathForClaim } from '@/shared/auth/route-guard';
import { verifyDashboardClaim } from '@/shared/auth/verify-dashboard-claim';

type LoginRequestBody = {
  readonly actorType?: unknown;
  readonly email?: unknown;
  readonly password?: unknown;
};

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json().catch(() => null)) as LoginRequestBody | null;
  if (!isLoginRequestBody(body)) {
    return NextResponse.json({ message: 'Invalid sign-in request.' }, { status: 400 });
  }

  let backendResponse: Response;
  try {
    backendResponse = await requestDashboardLogin(body);
  } catch {
    return NextResponse.json(
      { message: 'The authentication service is unavailable.' },
      { status: 503 },
    );
  }

  const session = await readDashboardLoginPayload(backendResponse);
  if (session === null) {
    const response = NextResponse.json(
      {
        message:
          backendResponse.status === 401
            ? 'Invalid email, password, or account type.'
            : 'Unable to sign in.',
      },
      { status: backendResponse.status === 401 ? 401 : 502 },
    );
    clearDashboardSession(response);
    return response;
  }

  const claim = await verifyDashboardClaim(session.claim);
  if (claim === null) {
    const response = NextResponse.json(
      { message: 'The authentication service returned an invalid session.' },
      { status: 502 },
    );
    clearDashboardSession(response);
    return response;
  }

  const response = NextResponse.json({ redirectPath: homePathForClaim(claim) });
  setDashboardSession(response, {
    claim: session.claim,
    expiresIn: session.expires_in,
    token: session.token,
  });
  return response;
}

function isLoginRequestBody(value: LoginRequestBody | null): value is DashboardLoginCredentials {
  return (
    value !== null &&
    (value.actorType === 'admin' || value.actorType === 'branch') &&
    typeof value.email === 'string' &&
    typeof value.password === 'string'
  );
}
