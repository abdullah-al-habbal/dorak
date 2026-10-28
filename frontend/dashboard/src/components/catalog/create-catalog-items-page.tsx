import { CatalogItemsPage } from "@/components/catalog/catalog-items-page";

export function createCatalogItemsPage() {
  return function CatalogItemsRoute() {
    return <CatalogItemsPage />;
  };
}
