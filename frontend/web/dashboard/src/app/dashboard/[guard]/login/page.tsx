import type { Metadata } from "next";

import { LoginScreen } from "@/components/auth/login-screen";
import { CALLBACK_PARAM } from "@/config/routes.constant";
import { parseGuardOrNotFound } from "@/lib/parse-guard";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ params, searchParams }: PageProps<"/dashboard/[guard]/login">) {
  const [{ guard }, query] = await Promise.all([params, searchParams]);
  const callback = query[CALLBACK_PARAM];
  return (
    <LoginScreen
      actor={parseGuardOrNotFound(guard)}
      callbackUrl={typeof callback === "string" ? callback : undefined}
    />
  );
}
