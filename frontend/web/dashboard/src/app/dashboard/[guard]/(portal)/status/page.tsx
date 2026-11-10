import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RegistrationStatusScreen } from "@/components/register/registration-status-screen";
import { AuthActor } from "@/enums/auth-actor.enum";
import { parseGuardOrNotFound } from "@/lib/parse-guard";

export const metadata: Metadata = { title: "Business review" };

/** The review of a new business: owners only. */
export default async function StatusPage({ params }: PageProps<"/dashboard/[guard]/status">) {
  const { guard } = await params;
  if (parseGuardOrNotFound(guard) !== AuthActor.Owner) notFound();
  return <RegistrationStatusScreen />;
}
