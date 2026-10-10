import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { PageCard } from "@/components/common/layout/page-card";
import { ROUTES } from "@/config/routes.constant";
import { getPortalAuthTitle } from "@/config/routes.util";
import { getServerI18n } from "@/i18n/server";
import type { AuthActor } from "@/services/api/auth/auth.types";

interface LoginEntryPageProps {
  actor: AuthActor;
  callbackUrl?: string;
}

export async function LoginEntryPage({ actor, callbackUrl }: LoginEntryPageProps) {
  const { dictionary } = await getServerI18n();
  return (
    <PageCard size="md">
      <h1 className="text-2xl font-semibold text-text-primary">{getPortalAuthTitle(actor, dictionary)}</h1>
      <LoginForm actor={actor} callbackUrl={callbackUrl} />
      <Link
        href={ROUTES.home}
        className="mt-6 inline-flex text-sm font-medium text-text-primary underline"
      >
        {dictionary.public.title}
      </Link>
    </PageCard>
  );
}
