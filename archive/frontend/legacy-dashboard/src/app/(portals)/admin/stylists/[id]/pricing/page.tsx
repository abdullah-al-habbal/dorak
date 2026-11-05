import { BarberServiceTermsPage } from "@/components/people/barber-service-terms-page";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <BarberServiceTermsPage actor="admin" barberId={(await params).id} />;
}
