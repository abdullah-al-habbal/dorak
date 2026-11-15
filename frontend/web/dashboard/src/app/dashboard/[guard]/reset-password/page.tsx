import type { Metadata } from "next";

import { ResetPasswordScreen } from "@/components/auth/screens/reset-password-screen";
import { RESET_LINK_EMAIL_PARAM, RESET_LINK_TOKEN_PARAM } from "@/config/routes.constant";
import { parseGuardOrNotFound } from "@/lib/parse-guard";

// The URL carries a live reset token: never send it on to another site as a referrer.
export const metadata: Metadata = { title: "Set a new password", referrer: "no-referrer", robots: { index: false, follow: false } };

function single(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}

export default async function ResetPasswordPage({ params, searchParams }: PageProps<"/dashboard/[guard]/reset-password">) {
  const [{ guard }, query] = await Promise.all([params, searchParams]);
  return <ResetPasswordScreen actor={parseGuardOrNotFound(guard)} email={single(query[RESET_LINK_EMAIL_PARAM])} token={single(query[RESET_LINK_TOKEN_PARAM])} />;
}
