import type { AuthActor } from "@/services/api/auth/auth.types";
import { LoginEntryPage } from "@/components/auth/login-entry-page";

interface LoginPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export function createLoginPage(actor: AuthActor) {
  return async function LoginPage({ searchParams }: LoginPageProps) {
    const { callbackUrl } = await searchParams;

    return <LoginEntryPage actor={actor} callbackUrl={callbackUrl} />;
  };
}
