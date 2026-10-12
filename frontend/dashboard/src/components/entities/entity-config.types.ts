import type { DashboardResource } from "@/services/api/dashboard/dashboard-resource.types";

export interface EntityColumn<TEntity> {
  id: string;
  label: string;
  value: (entity: TEntity) => React.ReactNode;
}

export interface EntityConfig<TEntity> {
  resource: Exclude<DashboardResource, "overview">;
  columns: EntityColumn<TEntity>[];
}
