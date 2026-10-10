import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { forwardDashboardRequest } from '@/shared/api/dashboard-auth';
import { dashboardTokenCookieName, clearDashboardSession } from '@/shared/auth/dashboard-session';

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(request: Request, context: RouteContext): Promise<NextResponse> {
  return proxyDashboardRequest(request, context);
}

export async function POST(request: Request, context: RouteContext): Promise<NextResponse> {
  return proxyDashboardRequest(request, context);
}

export async function PUT(request: Request, context: RouteContext): Promise<NextResponse> {
  return proxyDashboardRequest(request, context);
}

export async function PATCH(request: Request, context: RouteContext): Promise<NextResponse> {
  return proxyDashboardRequest(request, context);
}

export async function DELETE(request: Request, context: RouteContext): Promise<NextResponse> {
  return proxyDashboardRequest(request, context);
}

async function proxyDashboardRequest(
  request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  const { path } = await context.params;
  const token = (await cookies()).get(dashboardTokenCookieName)?.value;
  if (token === undefined || !isDashboardPath(path)) {
    return unauthorizedResponse();
  }

  let backendResponse: Response;
  try {
    backendResponse = await forwardDashboardRequest(request, `/${path.join('/')}`, token);
  } catch {
    return NextResponse.json({ message: 'The dashboard service is unavailable.' }, { status: 503 });
  }

  const response = new NextResponse(backendResponse.body, {
    headers: responseHeaders(backendResponse),
    status: backendResponse.status,
  });
  if (backendResponse.status === 401) {
    clearDashboardSession(response);
  }
  return response;
}

function unauthorizedResponse(): NextResponse {
  const response = NextResponse.json({ message: 'Your session has expired.' }, { status: 401 });
  clearDashboardSession(response);
  return response;
}

function isDashboardPath(path: readonly string[]): boolean {
  return (
    path[0] === 'dashboard' &&
    path.length > 1 &&
    path.every((segment) => /^[A-Za-z0-9_-]+$/.test(segment))
  );
}

function responseHeaders(response: Response): Headers {
  const headers = new Headers();
  const contentType = response.headers.get('content-type');
  const requestId = response.headers.get('x-request-id');
  if (contentType !== null) {
    headers.set('content-type', contentType);
  }
  if (requestId !== null) {
    headers.set('x-request-id', requestId);
  }
  return headers;
}
