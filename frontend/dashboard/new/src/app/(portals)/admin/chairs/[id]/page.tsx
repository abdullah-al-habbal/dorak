import { EntityDetailPage } from "@/components/entities/entity-detail-page";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { return <EntityDetailPage actor="admin" resource="chairs" id={(await params).id} />; }
