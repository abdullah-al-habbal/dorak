import { defineConfig, devices } from "@playwright/test";

import { E2E_APP_PORT, E2E_APP_URL, E2E_BACKEND_PORT, E2E_BACKEND_URL, E2E_DIST_DIR, E2E_SESSION_SECRET } from "@tests/e2e/support/e2e-env.constant";

const MOBILE = { width: 390, height: 844 };
const ULTRAWIDE = { width: 3440, height: 1440 };
const DESKTOP = { width: 1280, height: 800 };

export default defineConfig({
  testDir: "tests/e2e",
  testMatch: "**/*.spec.ts",
  // The stand-in backend keeps state (saved hours), so tests run one at a time.
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: { baseURL: E2E_APP_URL, trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: DESKTOP } },
    { name: "mobile-390", use: { ...devices["Desktop Chrome"], viewport: MOBILE, hasTouch: true } },
    { name: "ultrawide-3440", use: { ...devices["Desktop Chrome"], viewport: ULTRAWIDE } },
  ],
  webServer: [
    {
      command: "node tests/e2e/support/fake-backend.mjs",
      port: E2E_BACKEND_PORT,
      reuseExistingServer: !process.env.CI,
      env: { E2E_BACKEND_PORT: String(E2E_BACKEND_PORT), DASHBOARD_SESSION_SECRET: E2E_SESSION_SECRET },
    },
    {
      command: `npx next dev -p ${E2E_APP_PORT}`,
      url: `${E2E_APP_URL}/dashboard/manager/login`,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
      env: { BACKEND_API_URL: E2E_BACKEND_URL, DASHBOARD_SESSION_SECRET: E2E_SESSION_SECRET, NEXT_DIST_DIR: E2E_DIST_DIR, DASHBOARD_E2E: "1" },
    },
  ],
});
