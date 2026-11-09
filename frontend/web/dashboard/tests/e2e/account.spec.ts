import { expect, test } from "@playwright/test";

import {
  E2E_ACCOUNT_ADMIN_EMAIL,
  E2E_ACCOUNT_ADMIN_NAME,
  E2E_ACCOUNT_ADMIN_PASSWORD,
  E2E_ACCOUNT_ADMIN_PENDING_CODE,
  E2E_ACCOUNT_ADMIN_PENDING_EMAIL,
} from "@tests/e2e/support/e2e-env.constant";
import { dictionaryFor, expectNoHorizontalScroll, resetBackend, signInAdminThroughForm } from "@tests/e2e/support/sign-in";

const en = dictionaryFor("en");
const ar = dictionaryFor("ar");
const t = en.account;
const ACCOUNT = "/dashboard/admin/account";
const NEW_PASSWORD = "another-strong-password-7";

test.describe("account page", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    await resetBackend();
    await signInAdminThroughForm(page, { email: E2E_ACCOUNT_ADMIN_EMAIL, password: E2E_ACCOUNT_ADMIN_PASSWORD });
    await page.goto(ACCOUNT);
  });
  test.afterEach(async () => {
    await resetBackend();
  });

  test("lists the five sections and fits the viewport", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1, name: t.title })).toBeVisible();
    for (const title of [t.profile.title, t.email.title, t.password.title, t.notifications.title, t.language.title]) {
      await expect(page.getByRole("heading", { level: 2, name: title })).toBeVisible();
    }
    await expectNoHorizontalScroll(page);
  });

  test("the user menu opens the account page", async ({ page }) => {
    await page.goto("/dashboard/admin");
    await page.getByRole("button", { name: en.shell.profile.menu }).click();
    await page.getByRole("menuitem", { name: en.shell.profile.account }).click();
    await expect(page).toHaveURL(new RegExp(`${ACCOUNT}$`));
  });

  test("renaming updates the header and survives a reload", async ({ page }) => {
    await expect(page.getByLabel(t.profile.name)).toHaveValue(E2E_ACCOUNT_ADMIN_NAME);
    await page.getByLabel(t.profile.name).fill("Renamed Admin");
    await page.getByRole("button", { name: t.profile.save }).click();
    await expect(page.getByText(t.profile.saved)).toBeVisible();
    await expect(page.getByRole("button", { name: en.shell.profile.menu })).toContainText("Renamed Admin");
    await page.reload();
    await expect(page.getByLabel(t.profile.name)).toHaveValue("Renamed Admin");
  });

  test("an empty name is refused inline", async ({ page }) => {
    await page.getByLabel(t.profile.name).fill("   ");
    await page.getByRole("button", { name: t.profile.save }).click();
    await expect(page.getByText(t.profile.nameInvalid)).toBeVisible();
  });

  test("a pending email change asks for the code; a wrong code is refused and the right one switches the email", async ({ page }) => {
    await expect(page.getByText(E2E_ACCOUNT_ADMIN_EMAIL)).toBeVisible();
    await expect(page.getByText(t.email.pending.replace("{email}", E2E_ACCOUNT_ADMIN_PENDING_EMAIL))).toBeVisible();

    await page.getByLabel(t.email.code).fill("000000");
    await page.getByRole("button", { name: t.email.confirm }).click();
    await expect(page.getByRole("alert").first()).toBeVisible();
    await expect(page.getByText(E2E_ACCOUNT_ADMIN_EMAIL)).toBeVisible();

    await page.getByLabel(t.email.code).fill(E2E_ACCOUNT_ADMIN_PENDING_CODE);
    await page.getByRole("button", { name: t.email.confirm }).click();
    await expect(page.getByText(t.email.changed.replace("{email}", E2E_ACCOUNT_ADMIN_PENDING_EMAIL))).toBeVisible();
    await expect(page.getByLabel(t.email.newEmail)).toBeVisible();
  });

  test("starting over returns to the new-email form, which validates the address", async ({ page }) => {
    await page.getByRole("button", { name: t.email.otherEmail }).click();
    await page.getByLabel(t.email.newEmail).fill("nope");
    await page.getByRole("button", { name: t.email.send }).click();
    await expect(page.getByText(t.email.emailInvalid)).toBeVisible();
  });

  test("changing the password keeps this session; the old password stops working", async ({ page, browser }) => {
    await page.getByLabel(t.password.current, { exact: true }).fill("wrong-password-here");
    await page.getByLabel(t.password.next, { exact: false }).first().fill(NEW_PASSWORD);
    await page.getByLabel(t.password.confirm).fill(NEW_PASSWORD);
    await page.getByRole("button", { name: t.password.save }).click();
    await expect(page.getByRole("alert").first()).toBeVisible();

    await page.getByLabel(t.password.current, { exact: true }).fill(E2E_ACCOUNT_ADMIN_PASSWORD);
    await page.getByRole("button", { name: t.password.save }).click();
    await expect(page.getByText(t.password.changed)).toBeVisible();

    await page.reload();
    await expect(page.getByRole("heading", { level: 1, name: t.title })).toBeVisible();

    const other = await browser.newPage();
    await other.goto("/dashboard/admin/login");
    await other.getByLabel(en.auth.email).fill(E2E_ACCOUNT_ADMIN_EMAIL);
    await other.getByLabel(en.auth.password, { exact: true }).fill(E2E_ACCOUNT_ADMIN_PASSWORD);
    await other.getByRole("button", { name: en.auth.submit }).click();
    await expect(other.getByText(en.auth.invalidCredentials)).toBeVisible();
    await other.close();
  });

  test("a mismatched confirmation is refused before any request", async ({ page }) => {
    await page.getByLabel(t.password.current, { exact: true }).fill(E2E_ACCOUNT_ADMIN_PASSWORD);
    await page.getByLabel(t.password.next, { exact: false }).first().fill(NEW_PASSWORD);
    await page.getByLabel(t.password.confirm).fill(`${NEW_PASSWORD}!`);
    await page.getByRole("button", { name: t.password.save }).click();
    await expect(page.getByText(t.password.mismatch)).toBeVisible();
  });

  test("a notification switch flips at once and stays after a reload", async ({ page }) => {
    const label = t.notifications.keys.allows_booking_notifications.label;
    const toggle = page.getByRole("switch", { name: t.notifications.toggleLabel.replace("{setting}", label) });
    await expect(toggle).toBeChecked();
    await toggle.click();
    await expect(toggle).not.toBeChecked();
    await expect(page.getByText(t.notifications.turnedOff.replace("{setting}", label))).toBeVisible();
    await page.reload();
    await expect(toggle).not.toBeChecked();
  });

  test("choosing Arabic saves the language and switches the page to RTL", async ({ page }) => {
    await page.locator("#account-language").selectOption("ar");
    await expect(page.getByRole("heading", { level: 1, name: ar.account.title })).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expectNoHorizontalScroll(page);
  });
});
