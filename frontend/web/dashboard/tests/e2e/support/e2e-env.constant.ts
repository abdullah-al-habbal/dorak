/** The suite drives the real stack: Next.js on 3000 talking to the Laravel API on 8000. */
export const E2E_APP_PORT = 3000;
export const E2E_BACKEND_PORT = 8000;
export const E2E_APP_URL = `http://localhost:${E2E_APP_PORT}`;
export const E2E_BACKEND_URL = `http://127.0.0.1:${E2E_BACKEND_PORT}`;
/** The backend project, relative to the dashboard folder; artisan runs from here. */
export const E2E_BACKEND_DIR = "../../../backend";
/** Created by `Database\Seeders\E2eDashboardSeeder`; keep in sync with that class. */
export const E2E_EMAIL = "e2e-manager@dorak.test";
export const E2E_PASSWORD = "e2e-password-123";
export const E2E_SEEDER_CLASS = "Database\\Seeders\\E2eDashboardSeeder";
/** Browser session saved by the global setup so specs do not hit the sign-in rate limit. */
export const E2E_STORAGE_STATE = "tests/e2e/.auth/manager.json";
