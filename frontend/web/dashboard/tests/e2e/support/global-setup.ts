import { chromium } from "@playwright/test";
import type { Browser } from "@playwright/test";

import { artisan } from "@tests/e2e/support/artisan";
import { E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD, E2E_ADMIN_STORAGE_STATE, E2E_APP_URL, E2E_BARBER_EMAIL, E2E_BARBER_PASSWORD, E2E_BARBER_STORAGE_STATE, E2E_EMAIL, E2E_OWNER_EMAIL, E2E_OWNER_PASSWORD, E2E_OWNER_STORAGE_STATE, E2E_PASSWORD, E2E_SEEDER_CLASS, E2E_STORAGE_STATE } from "@tests/e2e/support/e2e-env.constant";
import { enDictionary } from "@/locales/en/index.constant";

/** Rebuilds the dev database, seeds the E2E baseline, then signs the seeded manager in once. */
export default async function globalSetup(): Promise<void> {
  await artisan("migrate:fresh", "--seed");
  await artisan("db:seed", `--class=${E2E_SEEDER_CLASS}`);

  const browser = await chromium.launch();
  try {
    await saveSession(browser, { guard: "manager", email: E2E_EMAIL, password: E2E_PASSWORD, path: E2E_STORAGE_STATE });
    await saveSession(browser, { guard: "owner", email: E2E_OWNER_EMAIL, password: E2E_OWNER_PASSWORD, path: E2E_OWNER_STORAGE_STATE });
    await saveSession(browser, { guard: "admin", email: E2E_ADMIN_EMAIL, password: E2E_ADMIN_PASSWORD, path: E2E_ADMIN_STORAGE_STATE });
    await saveSession(browser, { guard: "barber", email: E2E_BARBER_EMAIL, password: E2E_BARBER_PASSWORD, path: E2E_BARBER_STORAGE_STATE });
  } finally {
    await browser.close();
  }
}

interface SessionTarget {
  guard: string;
  email: string;
  password: string;
  path: string;
}

async function saveSession(browser: Browser, target: SessionTarget): Promise<void> {
  const context = await browser.newContext({ baseURL: E2E_APP_URL });
  const page = await context.newPage();
  const { auth } = enDictionary;
  await page.goto(`/dashboard/${target.guard}/login`);
  await page.getByLabel(auth.email).fill(target.email);
  await page.getByLabel(auth.password, { exact: true }).fill(target.password);
  await page.getByRole("button", { name: auth.submit }).click();
  await page.waitForURL((url) => !url.pathname.endsWith("/login"));
  await context.storageState({ path: target.path });
  await context.close();
}
