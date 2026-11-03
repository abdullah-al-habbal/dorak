import { BarberServiceTermsPage } from "@/components/people/barber-service-terms-page";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <BarberServiceTermsPage actor="owner" barberId={(await params).id} />;
}
