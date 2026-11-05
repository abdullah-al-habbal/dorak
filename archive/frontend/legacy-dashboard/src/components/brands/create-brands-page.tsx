import { BrandsPage } from "@/components/brands/brands-page";

export function createBrandsPage() {
  return function BrandsRoute() {
    return <BrandsPage />;
  };
}
