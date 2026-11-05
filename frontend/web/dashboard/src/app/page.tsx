import { redirect } from "next/navigation";

import { ROUTE_ROOT } from "@/config/routes.constant";

export default function HomePage() {
  redirect(ROUTE_ROOT);
}
