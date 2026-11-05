import { ROUTES } from "@/config/routes.constant";
import { redirect } from "next/navigation";

export default function Page() {
  redirect(ROUTES.operations.overview("owner"));
}
