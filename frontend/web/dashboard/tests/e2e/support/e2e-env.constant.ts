/** The suite drives the real stack: Next.js on 3000 talking to the Laravel API on 8000. */
/** Both default to those ports; set `E2E_APP_PORT` / `E2E_BACKEND_PORT` when another project already holds one. */
export const E2E_APP_PORT = Number(process.env.E2E_APP_PORT ?? 3000);
export const E2E_BACKEND_PORT = Number(process.env.E2E_BACKEND_PORT ?? 8000);
export const E2E_APP_URL = `http://localhost:${E2E_APP_PORT}`;
export const E2E_BACKEND_URL = `http://127.0.0.1:${E2E_BACKEND_PORT}`;
/** The backend project, relative to the dashboard folder; artisan runs from here. */
export const E2E_BACKEND_DIR = "../../../backend";
/** Created by `Database\Seeders\E2eDashboardSeeder`; keep in sync with that class. */
export const E2E_EMAIL = "e2e-manager@dorak.test";
export const E2E_PASSWORD = "e2e-password-123";
export const E2E_SEEDER_CLASS = "Database\\Seeders\\E2eDashboardSeeder";
/**
 * Extra time a hook gets for a reset. An afterEach hook has its own budget, equal to the test timeout (30 s);
 * under full-suite load the reset seed (about 4 s alone) has stalled past it on mobile-390.
 */
export const RESET_BACKEND_EXTRA_MS = 60_000;
/** Kills a reset seed that hangs (about 4 s normally), so it fails with an error inside the extra time above. */
export const RESET_SEED_TIMEOUT_MS = 45_000;
/** Browser session saved by the global setup so specs do not hit the sign-in rate limit. */
export const E2E_STORAGE_STATE = "tests/e2e/.auth/manager.json";
/** The seeded brand owner (same seeder); owner-only specs reuse this session. */
export const E2E_OWNER_EMAIL = "e2e-owner@dorak.test";
export const E2E_OWNER_PASSWORD = "e2e-password-123";
export const E2E_OWNER_STORAGE_STATE = "tests/e2e/.auth/owner.json";
/** `E2eDashboardSeeder::PENDING_BRAND_NAME` and its owner, who owns no other brand (signs in through the form). */
export const E2E_PENDING_BRAND_NAME = "E2E Pending Cuts";
export const E2E_PENDING_OWNER_EMAIL = "e2e-pending-owner@dorak.test";
/** An approved brand from the base `BrandSeeder`; every E2E reset removes its subscription, so a plan can be assigned to it. */
export const E2E_ASSIGNABLE_BRAND_NAME = "Dorak Demo";
/** The seeded stylist (same seeder) who signs in to the barber portal; schedule specs reuse this session. */
export const E2E_BARBER_EMAIL = "omar.e2e@dorak.test";
export const E2E_BARBER_PASSWORD = "e2e-password-123";
export const E2E_BARBER_STORAGE_STATE = "tests/e2e/.auth/barber.json";
/** The platform admin created by the base `AdminSeeder` (`migrate:fresh --seed`); admin specs reuse this session. */
export const E2E_ADMIN_EMAIL = "admin@dorak.sy";
export const E2E_ADMIN_PASSWORD = "password";
export const E2E_ADMIN_STORAGE_STATE = "tests/e2e/.auth/admin.json";
/** Dedicated admins for the password-recovery and account specs; created by `E2eDashboardSeeder::restoreAccessAdmins`. */
export const E2E_RESET_ADMIN_EMAIL = "e2e-reset-admin@dorak.test";
export const E2E_RESET_ADMIN_PASSWORD = "e2e-password-123";
/** The plain token the seeder stores (hashed) for the reset admin. */
export const E2E_RESET_ADMIN_TOKEN = "e2e-reset-token-0123456789abcdef0123456789abcdef0123456789abcdef";
export const E2E_ACCOUNT_ADMIN_EMAIL = "e2e-account-admin@dorak.test";
export const E2E_ACCOUNT_ADMIN_PASSWORD = "e2e-password-123";
export const E2E_ACCOUNT_ADMIN_NAME = "E2E Account Admin";
/** The email change the seeder leaves pending for the account admin, and its code. */
export const E2E_ACCOUNT_ADMIN_PENDING_EMAIL = "e2e-account-admin-new@dorak.test";
export const E2E_ACCOUNT_ADMIN_PENDING_CODE = "123456";
/** `E2eDashboardSeeder::REGISTERED_OWNER_EMAIL`: the owner the registration spec signs up; every reset removes it. */
export const E2E_REGISTERED_OWNER_EMAIL = "e2e-new-owner@dorak.test";
export const E2E_REGISTERED_OWNER_PASSWORD = "a-long-owner-password-1";
/** `E2eDashboardSeeder::APP_CLIENT_EMAIL`: a verified app client with no brand. */
export const E2E_APP_CLIENT_EMAIL = "e2e-app-client@dorak.test";
export const E2E_APP_CLIENT_PASSWORD = "e2e-password-123";
/** The code the registration spec plants for the signed-up owner. */
export const E2E_PLANTED_CODE = "246810";
