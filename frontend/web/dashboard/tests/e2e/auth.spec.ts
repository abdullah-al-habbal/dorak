import { expect, test } from "@playwright/test";

import { E2E_EMAIL } from "@tests/e2e/support/e2e-env.constant";
import { dictionaryFor, expectNoHorizontalScroll, signInThroughForm } from "@tests/e2e/support/sign-in";

const { auth, bookings } = dictionaryFor("en");

test.describe("auth", () => {
  // These specs exercise the form, so they start signed out.
  test.use({ storageState: { cookies: [], origins: [] } });

  test("rejects wrong credentials with an inline message", async ({ page }) => {
    await page.goto("/dashboard/manager/login");
    await page.getByLabel(auth.email).fill(E2E_EMAIL);
    await page.getByLabel(auth.password, { exact: true }).fill("not-the-password");
    await page.getByRole("button", { name: auth.submit }).click();
    await expect(page.getByText(auth.invalidCredentials)).toBeVisible();
    await expectNoHorizontalScroll(page);
  });

  test("signs a manager in and lands in the portal", async ({ page }) => {
    await signInThroughForm(page);
    await expect(page).toHaveURL(/\/dashboard\/manager/);
    await page.goto("/dashboard/manager/bookings");
    await expect(page.getByRole("heading", { level: 1, name: bookings.title })).toBeVisible();
  });

  test("sends a signed-out visitor to the login page", async ({ page }) => {
    await page.goto("/dashboard/manager/bookings");
    await expect(page).toHaveURL(/\/login/);
  });
});
