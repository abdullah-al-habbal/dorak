import { EntityCrudForm } from "@/components/entities/entity-crud-form";

export function createEntityCrudPage(resource: "branches" | "chairs" | "services" | "stylists") {
  return function EntityCrudPage() { return <section className="space-y-6"><h1 className="text-2xl font-semibold text-title-50">Create {resource}</h1><EntityCrudForm resource={resource} /></section>; };
}

export function createEntityEditPage(resource: "branches" | "chairs" | "services" | "stylists") {
  return function EntityEditPage({ params }: { params: Promise<{ id: string }> }) { return <EntityEditRoute params={params} resource={resource} />; };
}

async function EntityEditRoute({ params, resource }: { params: Promise<{ id: string }>; resource: "branches" | "chairs" | "services" | "stylists" }) {
  const { id } = await params;
  return <section className="space-y-6"><h1 className="text-2xl font-semibold text-title-50">Edit {resource}</h1><EntityCrudForm resource={resource} id={id} /></section>;
}
