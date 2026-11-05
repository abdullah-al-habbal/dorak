import type { Locale } from "@/i18n/locales.types";
import type { DashboardResource } from "@/services/api/dashboard/shared/types/dashboard-resource.types";

export interface EntityColumn<TEntity> {
  id: string;
  label: string;
  value: (entity: TEntity, locale: Locale) => React.ReactNode;
}

export interface EntityConfig<TEntity> {
  resource: Exclude<DashboardResource, "overview">;
  columns: EntityColumn<TEntity>[];
  /** Whether `/{actor}/{resource}/{id}/edit` exists. Bookings has no edit route — only the actions dialog and the detail page. */
  hasEditRoute: boolean;
}
