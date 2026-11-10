import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import {
  E2E_ADMIN_STORAGE_STATE,
  E2E_APP_CLIENT_EMAIL,
  E2E_APP_CLIENT_PASSWORD,
  E2E_APP_URL,
  E2E_PLANTED_CODE,
  E2E_REGISTERED_OWNER_EMAIL,
  E2E_REGISTERED_OWNER_PASSWORD,
} from "@tests/e2e/support/e2e-env.constant";
import { plantVerificationCode } from "@tests/e2e/support/owner-registration";
import { dictionaryFor, expectNoHorizontalScroll, resetBackend } from "@tests/e2e/support/sign-in";

const en = dictionaryFor("en");
const ar = dictionaryFor("ar");
const t = en.registerBusiness;
const BRAND_NAME = "E2E New Cuts";
const REGISTER = "/register/business";

async function fillBrand(page: Page): Promise<void> {
  await page.getByLabel(t.brandNameEn).fill(BRAND_NAME);
  await page.getByLabel(t.brandNameAr).fill("قصات جديدة");
  await page.getByLabel(t.currency).selectOption("USD");
}

async function fillOwner(page: Page): Promise<void> {
  await page.getByLabel(t.name).fill("E2E New Owner");
  await page.getByLabel(t.email, { exact: true }).fill(E2E_REGISTERED_OWNER_EMAIL);
  await page.getByLabel(t.password, { exact: true }).fill(E2E_REGISTERED_OWNER_PASSWORD);
  await page.getByLabel(t.passwordConfirmation, { exact: true }).fill(E2E_REGISTERED_OWNER_PASSWORD);
}

test.describe("owner self-registration", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async () => {
    await resetBackend();
  });
  test.afterEach(async () => {
    await resetBackend();
  });

  test("registers, confirms the email, follows the review, and sees the approval", async ({ page, browser }) => {
    await page.context().addCookies([{ name: "NEXT_LOCALE", value: "en", url: E2E_APP_URL }]);
    await page.goto(REGISTER);
    await expect(page.getByRole("heading", { level: 1, name: t.title })).toBeVisible();
    await expectNoHorizontalScroll(page);

    await fillOwner(page);
    await fillBrand(page);
    await page.getByRole("button", { name: t.submit }).click();
    await expect(page.getByRole("heading", { level: 1, name: t.verify.title })).toBeVisible();

    await plantVerificationCode(E2E_REGISTERED_OWNER_EMAIL, E2E_PLANTED_CODE);
    await page.getByLabel(t.verify.code).fill("000000");
    await page.getByRole("button", { name: t.verify.submit }).click();
    await expect(page.getByText(t.verify.invalid)).toBeVisible();

    await page.getByLabel(t.verify.code).fill(E2E_PLANTED_CODE);
    await page.getByRole("button", { name: t.verify.submit }).click();
    await expect(page).toHaveURL(/\/dashboard\/owner\/status$/);
    await expect(page.getByRole("heading", { level: 2, name: BRAND_NAME })).toBeVisible();
    await expect(page.getByRole("listitem").filter({ hasText: t.status.steps.review })).toHaveAttribute("aria-current", "step");
    await expect(page.getByText(t.status.pendingNote)).toBeVisible();

    // The platform admin approves it from the existing queue.
    const adminContext = await browser.newContext({ storageState: E2E_ADMIN_STORAGE_STATE, baseURL: E2E_APP_URL });
    const admin = await adminContext.newPage();
    await admin.goto("/dashboard/admin/brands");
    await admin.getByRole("button", { name: en.adminBrands.rowAction.replace("{brand}", BRAND_NAME) }).click();
    await admin.getByRole("dialog").getByRole("button", { name: en.adminBrands.confirm.confirm }).click();
    await expect(admin.getByText(en.adminBrands.toast.approved)).toBeVisible();
    await adminContext.close();

    await page.reload();
    await expect(page.getByText(t.status.approvedNote)).toBeVisible();
    await expect(page.getByRole("listitem").filter({ hasText: t.status.steps.approved })).toHaveAttribute("aria-current", "step");

    // The branch prepared while waiting is there, and the page no longer says the brand is waiting.
    await page.goto("/dashboard/owner/branches");
    await expect(page.getByText(BRAND_NAME, { exact: true }).locator("visible=true").first()).toBeVisible();
  });

  test("an existing app client adds a business to the same account", async ({ page }) => {
    await page.context().addCookies([{ name: "NEXT_LOCALE", value: "en", url: E2E_APP_URL }]);
    await page.goto(REGISTER);
    await page.getByRole("button", { name: t.haveAccount }).click();
    await expect(page.getByRole("heading", { level: 1, name: t.existing.title })).toBeVisible();

    await page.getByLabel(t.email, { exact: true }).fill(E2E_APP_CLIENT_EMAIL);
    await page.getByLabel(t.password, { exact: true }).fill("wrong-password-123");
    await fillBrand(page);
    await page.getByRole("button", { name: t.existing.submit }).click();
    await expect(page.getByText(t.existing.invalid)).toBeVisible();

    await page.getByLabel(t.password, { exact: true }).fill(E2E_APP_CLIENT_PASSWORD);
    await page.getByRole("button", { name: t.existing.submit }).click();
    await expect(page).toHaveURL(/\/dashboard\/owner\/status$/);
    await expect(page.getByRole("heading", { level: 2, name: BRAND_NAME })).toBeVisible();
  });

  test("shows the form validation and renders right-to-left in Arabic", async ({ page }) => {
    await page.context().addCookies([{ name: "NEXT_LOCALE", value: "ar", url: E2E_APP_URL }]);
    await page.goto(REGISTER);
    await expect(page.getByRole("heading", { level: 1, name: ar.registerBusiness.title })).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await page.getByRole("button", { name: ar.registerBusiness.submit }).click();
    await expect(page.getByText(ar.registerBusiness.validation.name)).toBeVisible();
    await expectNoHorizontalScroll(page);
  });
});
