import { BACKEND_TIMEOUT_MS } from "@/config/backend.constant";
import { currencyListSchema } from "@/schemas/currency.zod";
import { apiSuccessBodySchema } from "@/schemas/api-success-body.zod";
import { readBackendUrl } from "@/services/api/auth/session-keys.util";
import type { Currency } from "@/types/currency.type";

const PUBLIC_CURRENCIES_PATH = "/api/v1/currencies";

/** The currencies a new business may pick. Public on the backend, so the sign-up page reads it before anyone is signed in. */
export async function fetchPublicCurrencies(): Promise<Currency[]> {
  try {
    const response = await fetch(`${readBackendUrl()}${PUBLIC_CURRENCIES_PATH}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(BACKEND_TIMEOUT_MS),
    });
    if (!response.ok) return [];
    const body = apiSuccessBodySchema.safeParse(await response.json().catch(() => null));
    const list = currencyListSchema.safeParse(body.success ? body.data.data : null);
    return list.success ? list.data : [];
  } catch {
    return [];
  }
}
