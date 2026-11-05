import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";

import { arDictionary } from "@/locales/ar/index.constant";
import { enDictionary } from "@/locales/en/index.constant";
import type { Dictionary } from "@/types/dictionary.type";
import { E2E_APP_URL, E2E_BACKEND_URL, E2E_EMAIL, E2E_PASSWORD } from "@tests/e2e/support/e2e-env.constant";

export type E2ELocale = "en" | "ar";

export function dictionaryFor(locale: E2ELocale): Dictionary {
  return locale === "ar" ? arDictionary : enDictionary;
}

/** Signs a branch manager in through the real form and waits for the portal. */
export async function signIn(page: Page, locale: E2ELocale = "en"): Promise<void> {
  const { auth } = dictionaryFor(locale);
  await page.context().addCookies([{ name: "NEXT_LOCALE", value: locale, url: E2E_APP_URL }]);
  // The dev-only Next issue badge floats over bottom-anchored controls (the save bar) and swallows clicks on phones.
  await page.addInitScript(() => {
    document.addEventListener("DOMContentLoaded", () => {
      const style = document.createElement("style");
      style.textContent = "nextjs-portal { display: none !important; }";
      document.head.appendChild(style);
    });
  });
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

/** Clears the stand-in backend's saved state so a test starts from a branch with no working hours. */
export async function resetBackend(): Promise<void> {
  const response = await fetch(`${E2E_BACKEND_URL}/api/v1/dashboard/__reset`, { method: "POST" });
  expect(response.ok).toBe(true);
}
