import { EntityListPage } from "@/components/entities/entity-list-page";
import type { DashboardResource } from "@/services/api/dashboard/dashboard-resource.types";

export function createEntityListPage(resource: Exclude<DashboardResource, "overview">) {
  return function ResourcePage() {
    return <EntityListPage resource={resource} />;
  };
}
