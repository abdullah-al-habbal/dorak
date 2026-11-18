import { defineConfig, devices } from "@playwright/test";

import { E2E_APP_PORT, E2E_APP_URL, E2E_BACKEND_DIR, E2E_BACKEND_PORT, E2E_BACKEND_URL, E2E_STORAGE_STATE } from "@tests/e2e/support/e2e-env.constant";

const MOBILE = { width: 390, height: 844 };
const DESKTOP = { width: 1440, height: 900 };
const ULTRAWIDE = { width: 3440, height: 1440 };
const BUILD_AND_START_TIMEOUT_MS = 600_000;
const FIREFOX_SMOKE_SPECS = /(auth|error-pages|seo)\.spec\.ts$/;

export default defineConfig({
  testDir: "tests/e2e",
  testMatch: "**/*.spec.ts",
  // The suite shares one real database that specs reset, so tests run one at a time.
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  // Rebuilds and seeds the database, then saves the manager's browser session.
  globalSetup: "tests/e2e/support/global-setup.ts",
  use: { baseURL: E2E_APP_URL, trace: "retain-on-failure", storageState: E2E_STORAGE_STATE },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: DESKTOP } },
    { name: "mobile-390", use: { ...devices["Desktop Chrome"], viewport: MOBILE, hasTouch: true } },
    { name: "ultrawide-3440", use: { ...devices["Desktop Chrome"], viewport: ULTRAWIDE } },
    // A smoke pass in a second engine: sign-in, the error pages and the page metadata. Not a compatibility claim for every screen.
    { name: "firefox", testMatch: FIREFOX_SMOKE_SPECS, use: { ...devices["Desktop Firefox"], viewport: DESKTOP } },
  ],
  // Both servers are reused when already running (`php artisan serve`, `npm start`).
  webServer: [
    {
      command: `php artisan serve --host=127.0.0.1 --port=${E2E_BACKEND_PORT}`,
      cwd: E2E_BACKEND_DIR,
      url: `${E2E_BACKEND_URL}/up`,
      reuseExistingServer: true,
      timeout: 60_000,
    },
    {
      // A production build avoids the dev server's runtime Google Fonts fetch, so it also runs offline.
      command: `npm run build && npm start -- -p ${E2E_APP_PORT}`,
      url: `${E2E_APP_URL}/dashboard/manager/login`,
      // The Next server must reach the API on the port this run chose, not the one in .env.local.
      env: { BACKEND_API_URL: E2E_BACKEND_URL },
      reuseExistingServer: true,
      timeout: BUILD_AND_START_TIMEOUT_MS,
    },
  ],
});
