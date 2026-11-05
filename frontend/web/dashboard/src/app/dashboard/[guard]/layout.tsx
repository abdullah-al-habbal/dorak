import { AUTH_ACTORS } from "@/config/auth-actors.constant";
import { parseGuardOrNotFound } from "@/lib/parse-guard";

export function generateStaticParams() {
  return AUTH_ACTORS.map((guard) => ({ guard }));
}

export default async function GuardLayout({ children, params }: LayoutProps<"/dashboard/[guard]">) {
  parseGuardOrNotFound((await params).guard);
  return children;
}
