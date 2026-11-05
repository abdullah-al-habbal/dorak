import { LandingPage } from "@/components/public/landing-page";
import { ROUTES } from "@/config/routes.constant";
import { getServerSession } from "@/services/api/auth/session.query";
import { redirect } from "next/navigation";

export default async function PublicLandingPage() {
  const session = await getServerSession();
  if (session !== null) redirect(ROUTES.portal[session.actor].root);

  return <LandingPage />;
}
