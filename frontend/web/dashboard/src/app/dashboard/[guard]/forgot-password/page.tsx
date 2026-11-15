import type { Metadata } from "next";

import { ForgotPasswordScreen } from "@/components/auth/screens/forgot-password-screen";
import { parseGuardOrNotFound } from "@/lib/parse-guard";

export const metadata: Metadata = { title: "Reset your password" };

export default async function ForgotPasswordPage({ params }: PageProps<"/dashboard/[guard]/forgot-password">) {
  const { guard } = await params;
  return <ForgotPasswordScreen actor={parseGuardOrNotFound(guard)} />;
}
