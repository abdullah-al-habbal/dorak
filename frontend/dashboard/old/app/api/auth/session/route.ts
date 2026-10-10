import { NextResponse } from 'next/server';
import { clearDashboardSession } from '@/shared/auth/dashboard-session';

export function DELETE(): NextResponse {
  const response = new NextResponse(null, { status: 204 });
  clearDashboardSession(response);
  return response;
}
