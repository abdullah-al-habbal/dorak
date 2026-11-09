import { expect, test } from "@playwright/test";

import {
  E2E_RESET_ADMIN_EMAIL,
  E2E_RESET_ADMIN_PASSWORD,
  E2E_RESET_ADMIN_TOKEN,
} from "@tests/e2e/support/e2e-env.constant";
import { dictionaryFor, expectNoHorizontalScroll, resetBackend, signInAdminThroughForm } from "@tests/e2e/support/sign-in";

const en = dictionaryFor("en");
const { auth, passwordReset: t } = en;
const NEW_PASSWORD = "a-brand-new-password-42";
const RESET_PAGE = "/dashboard/admin/reset-password";

function resetLink(token: string, email = E2E_RESET_ADMIN_EMAIL): string {
  return `${RESET_PAGE}?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
}

test.describe("password recovery", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async () => {
    await resetBackend();
  });
  test.afterEach(async () => {
    await resetBackend();
  });

  test("the sign-in page links to the forgot-password page", async ({ page }) => {
    await page.goto("/dashboard/admin/login");
    await page.getByRole("link", { name: t.forgotLink }).click();
    await expect(page).toHaveURL(/\/dashboard\/admin\/forgot-password$/);
    await expect(page.getByRole("heading", { level: 1, name: t.forgot.title })).toBeVisible();
    await expectNoHorizontalScroll(page);
  });

  test("asking for a link says the same thing for a known and an unknown email", async ({ page }) => {
    for (const email of [E2E_RESET_ADMIN_EMAIL, "nobody-here@dorak.test"]) {
      await page.goto("/dashboard/admin/forgot-password");
      await page.getByLabel(auth.email).fill(email);
      await page.getByRole("button", { name: t.forgot.submit }).click();
      await expect(page.getByRole("heading", { name: t.forgot.sentTitle })).toBeVisible();
      await expect(page.getByText(t.forgot.sentBody.replace("{email}", email))).toBeVisible();
    }
  });

  test("rejects a malformed email inline", async ({ page }) => {
    await page.goto("/dashboard/admin/forgot-password");
    await page.getByLabel(auth.email).fill("not-an-email");
    await page.getByRole("button", { name: t.forgot.submit }).click();
    await expect(page.getByText(t.validation.email)).toBeVisible();
  });

  test("a valid link sets the password, strips the token from the URL, and the old password stops working", async ({ page }) => {
    await page.goto(resetLink(E2E_RESET_ADMIN_TOKEN));
    await expect(page.getByRole("heading", { level: 1, name: t.reset.title })).toBeVisible();
    await expect.poll(() => page.url()).not.toContain("token=");
    await expectNoHorizontalScroll(page);

    await page.getByLabel(t.reset.newPassword, { exact: true }).fill("short");
    await page.getByLabel(t.reset.confirmPassword, { exact: true }).fill("short");
    await page.getByRole("button", { name: t.reset.submit }).click();
    await expect(page.getByText(t.validation.passwordLength)).toBeVisible();

    await page.getByLabel(t.reset.newPassword, { exact: true }).fill(NEW_PASSWORD);
    await page.getByLabel(t.reset.confirmPassword, { exact: true }).fill(`${NEW_PASSWORD}x`);
    await page.getByRole("button", { name: t.reset.submit }).click();
    await expect(page.getByText(t.validation.passwordMismatch)).toBeVisible();

    await page.getByLabel(t.reset.confirmPassword, { exact: true }).fill(NEW_PASSWORD);
    await page.getByRole("button", { name: t.reset.submit }).click();
    await expect(page).toHaveURL(/\/dashboard\/admin\/login\?reset=1/);
    await expect(page.getByText(t.doneNotice)).toBeVisible();

    await page.getByLabel(auth.email).fill(E2E_RESET_ADMIN_EMAIL);
    await page.getByLabel(auth.password, { exact: true }).fill(E2E_RESET_ADMIN_PASSWORD);
    await page.getByRole("button", { name: auth.submit }).click();
    await expect(page.getByText(auth.invalidCredentials)).toBeVisible();

    await signInAdminThroughForm(page, { email: E2E_RESET_ADMIN_EMAIL, password: NEW_PASSWORD });
    await expect(page).toHaveURL(/\/dashboard\/admin/);
  });

  test("a link works once: reusing it shows the unusable-link state", async ({ page }) => {
    await page.goto(resetLink(E2E_RESET_ADMIN_TOKEN));
    await page.getByLabel(t.reset.newPassword, { exact: true }).fill(NEW_PASSWORD);
    await page.getByLabel(t.reset.confirmPassword, { exact: true }).fill(NEW_PASSWORD);
    await page.getByRole("button", { name: t.reset.submit }).click();
    await expect(page).toHaveURL(/login\?reset=1/);

    await page.goto(resetLink(E2E_RESET_ADMIN_TOKEN));
    await page.getByLabel(t.reset.newPassword, { exact: true }).fill(NEW_PASSWORD);
    await page.getByLabel(t.reset.confirmPassword, { exact: true }).fill(NEW_PASSWORD);
    await page.getByRole("button", { name: t.reset.submit }).click();
    await expect(page.getByRole("heading", { name: t.reset.invalidTitle })).toBeVisible();
    await page.getByRole("link", { name: t.reset.requestNew }).click();
    await expect(page).toHaveURL(/forgot-password$/);
  });

  test("a made-up token and a link missing its token both show the unusable-link state", async ({ page }) => {
    await page.goto(resetLink("not-a-real-token"));
    await page.getByLabel(t.reset.newPassword, { exact: true }).fill(NEW_PASSWORD);
    await page.getByLabel(t.reset.confirmPassword, { exact: true }).fill(NEW_PASSWORD);
    await page.getByRole("button", { name: t.reset.submit }).click();
    await expect(page.getByRole("heading", { name: t.reset.invalidTitle })).toBeVisible();

    await page.goto(RESET_PAGE);
    await expect(page.getByRole("heading", { name: t.reset.invalidTitle })).toBeVisible();
  });

  test("the reset page is reachable while signed in, and sign-in no longer bounces to it", async ({ page }) => {
    await signInAdminThroughForm(page, { email: E2E_RESET_ADMIN_EMAIL, password: E2E_RESET_ADMIN_PASSWORD });
    await page.goto(resetLink("whatever"));
    await expect(page).toHaveURL(new RegExp(RESET_PAGE));
  });
});
