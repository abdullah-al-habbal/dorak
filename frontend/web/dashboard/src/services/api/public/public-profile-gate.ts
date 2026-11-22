import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { NOT_FOUND_ROUTE } from "@/config/routes.constant";
import { HttpStatus } from "@/enums/access/http-status.enum";
import { fetchPublicProfileStatus } from "@/services/api/public/public-profile";
import type { PublicProfileTarget } from "@/types/public/public-profile-target.type";

/**
 * A public profile page streams its body after the response status is sent, so `notFound()` in the page can
 * only produce a 200 with the 404 screen. The proxy knows the answer first: a slug the backend reports as
 * unknown or hidden is rewritten to the 404 route. Any other outcome (found, backend down) passes through,
 * so an outage still shows the page's own "unavailable" state, never a false 404.
 */
export async function gatePublicProfile(request: NextRequest, target: PublicProfileTarget): Promise<NextResponse> {
  const status = await fetchPublicProfileStatus(target);
  if (status === "not-found") return NextResponse.rewrite(new URL(NOT_FOUND_ROUTE, request.url), { status: HttpStatus.NotFound });
  return NextResponse.next();
}
