import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { OwnerBrandScreen } from "@/components/owner-brand/owner-brand-screen";
import { AuthActor } from "@/enums/access/auth-actor.enum";
import { parseGuardOrNotFound } from "@/lib/parse-guard";

export const metadata: Metadata = { title: "Brand" };

/** The owner's brand profile and "add a brand": owners only. */
export default async function BrandPage({ params }: PageProps<"/dashboard/[guard]/brand">) {
  const { guard } = await params;
  if (parseGuardOrNotFound(guard) !== AuthActor.Owner) notFound();
  return <OwnerBrandScreen />;
}
