import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { arDictionary } from "@/locales/ar/index.constant";
import { enDictionary } from "@/locales/en/index.constant";
import type { Dictionary } from "@/types/dictionary.type";
import { artisan } from "@tests/e2e/support/artisan";
import { E2E_APP_URL, E2E_EMAIL, E2E_PASSWORD, E2E_SEEDER_CLASS, RESET_BACKEND_EXTRA_MS, RESET_SEED_TIMEOUT_MS } from "@tests/e2e/support/e2e-env.constant";

export type E2ELocale = "en" | "ar";

export function dictionaryFor(locale: E2ELocale): Dictionary {
  return locale === "ar" ? arDictionary : enDictionary;
}

/** Opens the portal as the seeded manager (or owner, barber or admin). The session comes from the global setup's storage state. */
export async function signIn(page: Page, locale: E2ELocale = "en", guard: "manager" | "owner" | "barber" | "admin" = "manager"): Promise<void> {
  await page.context().addCookies([{ name: "NEXT_LOCALE", value: locale, url: E2E_APP_URL }]);
  // The dev-only Next issue badge floats over bottom-anchored controls (the save bar) and swallows clicks on phones.
  await page.addInitScript(() => {
    document.addEventListener("DOMContentLoaded", () => {
      const style = document.createElement("style");
      style.textContent = "nextjs-portal { display: none !important; }";
      document.head.appendChild(style);
    });
  });
  await page.goto(`/dashboard/${guard}`);
  await expect(page).not.toHaveURL(/\/login/);
}

/** Fills the real sign-in form; only for specs that exercise the form itself (they run signed out). */
export async function signInThroughForm(page: Page, locale: E2ELocale = "en"): Promise<void> {
  const { auth } = dictionaryFor(locale);
  await page.goto("/dashboard/manager/login");
  await page.getByLabel(auth.email).fill(E2E_EMAIL);
  await page.getByLabel(auth.password, { exact: true }).fill(E2E_PASSWORD);
  await page.getByRole("button", { name: auth.submit }).click();
  await expect(page).not.toHaveURL(/\/login/);
}

/** Fails when the page scrolls sideways, the usual sign of a layout that doesn't fit the viewport. */
export async function expectNoHorizontalScroll(page: Page): Promise<void> {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
}

/**
 * Restores the seeded baseline in the real database (no saved working hours, today's two bookings).
 * Called from test hooks: it adds its own time to the running test's budget, and a seed that hangs is killed.
 */
export async function resetBackend(): Promise<void> {
  const info = test.info();
  info.setTimeout(info.timeout + RESET_BACKEND_EXTRA_MS);
  await artisan(["db:seed", `--class=${E2E_SEEDER_CLASS}`], { timeoutMs: RESET_SEED_TIMEOUT_MS });
}
