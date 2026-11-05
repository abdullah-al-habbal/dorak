import { chromium } from "@playwright/test";

import { artisan } from "@tests/e2e/support/artisan";
import { E2E_APP_URL, E2E_EMAIL, E2E_PASSWORD, E2E_SEEDER_CLASS, E2E_STORAGE_STATE } from "@tests/e2e/support/e2e-env.constant";
import { enDictionary } from "@/locales/en/index.constant";

/** Rebuilds the dev database, seeds the E2E baseline, then signs the seeded manager in once. */
export default async function globalSetup(): Promise<void> {
  await artisan("migrate:fresh", "--seed");
  await artisan("db:seed", `--class=${E2E_SEEDER_CLASS}`);

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ baseURL: E2E_APP_URL });
    const { auth } = enDictionary;
    await page.goto("/dashboard/manager/login");
    await page.getByLabel(auth.email).fill(E2E_EMAIL);
    await page.getByLabel(auth.password, { exact: true }).fill(E2E_PASSWORD);
    await page.getByRole("button", { name: auth.submit }).click();
    await page.waitForURL((url) => !url.pathname.endsWith("/login"));
    await page.context().storageState({ path: E2E_STORAGE_STATE });
  } finally {
    await browser.close();
  }
}
