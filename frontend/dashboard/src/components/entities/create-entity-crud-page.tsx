import { EntityCrudForm } from "@/components/entities/entity-crud-form";
import { EntityCrudHeading } from "@/components/entities/entity-crud-heading";

export function createEntityCrudPage(
  resource: "branches" | "chairs" | "services" | "stylists",
) {
  return function EntityCrudPage() {
    return (
      <section className="space-y-6">
        <EntityCrudHeading resource={resource} />
        <EntityCrudForm resource={resource} />
      </section>
    );
  };
}

export function createEntityEditPage(
  resource: "branches" | "chairs" | "services" | "stylists",
) {
  return function EntityEditPage({
    params,
  }: {
    params: Promise<{ id: string }>;
  }) {
    return <EntityEditRoute params={params} resource={resource} />;
  };
}

async function EntityEditRoute({
  params,
  resource,
}: {
  params: Promise<{ id: string }>;
  resource: "branches" | "chairs" | "services" | "stylists";
}) {
  const { id } = await params;
  return (
    <section className="space-y-6">
      <EntityCrudHeading resource={resource} editing />
      <EntityCrudForm resource={resource} id={id} />
    </section>
  );
}
