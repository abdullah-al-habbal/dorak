import { expect, test } from "@playwright/test";

import { E2E_ADMIN_STORAGE_STATE, E2E_ASSIGNABLE_BRAND_NAME, E2E_OWNER_PASSWORD, E2E_OWNER_STORAGE_STATE, E2E_PENDING_BRAND_NAME, E2E_PENDING_OWNER_EMAIL } from "@tests/e2e/support/e2e-env.constant";
import { dictionaryFor, expectNoHorizontalScroll, resetBackend, signIn } from "@tests/e2e/support/sign-in";

const { auth, branches } = dictionaryFor("en");
const SEEDED = "E2E Salon";
const NEW_NAME = "E2E Annex";
const RENAMED = "E2E Annex Renamed";

test.use({ storageState: E2E_OWNER_STORAGE_STATE });

test.describe("owner branches", () => {
  test.afterEach(async () => {
    await resetBackend();
  });

  test("lists the seeded branch and filters it out by status", async ({ page }) => {
    await signIn(page, "en", "owner");
    await page.goto("/dashboard/owner/branches");
    await expect(page.getByRole("heading", { level: 1, name: branches.title })).toBeVisible();
    await expect(page.getByText(SEEDED).locator("visible=true").first()).toBeVisible();
    await expect(page.getByText(branches.states.results.replace("{count}", "1"))).toBeVisible();
    await expectNoHorizontalScroll(page);

    await page.getByLabel(branches.filters.status).selectOption("disabled");
    await expect(page).toHaveURL(/status=disabled/);
    await expect(page.getByText(branches.states.filteredTitle)).toBeVisible();
    await page.getByRole("button", { name: branches.filters.clear }).first().click();
    await expect(page.getByText(SEEDED).locator("visible=true").first()).toBeVisible();
  });

  test("creates, edits and deletes a branch", async ({ page }) => {
    await signIn(page, "en", "owner");
    await page.goto("/dashboard/owner/branches");

    await page.getByRole("button", { name: branches.newBranch }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: branches.form.create }).click();
    await expect(dialog.getByText(branches.form.validation.name).first()).toBeVisible();
    await expect(dialog.getByText(branches.form.validation.password)).toBeVisible();

    await dialog.getByLabel(branches.form.nameEn).fill(NEW_NAME);
    await dialog.getByLabel(branches.form.nameAr).fill("الملحق");
    await dialog.getByLabel(branches.form.email).fill("e2e-annex@dorak.test");
    await dialog.getByLabel(branches.form.password, { exact: true }).fill("e2e-annex-password-1");
    await dialog.getByLabel(branches.form.universe).selectOption("men");
    await dialog.getByRole("button", { name: branches.form.create }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByText(NEW_NAME).locator("visible=true").first()).toBeVisible();

    await page.getByText(NEW_NAME).locator("visible=true").first().click();
    const editDialog = page.getByRole("dialog");
    await expect(editDialog.getByLabel(branches.form.nameEn)).toHaveValue(NEW_NAME);
    await expect(editDialog.getByLabel(branches.form.nameAr)).toHaveValue("الملحق");
    await editDialog.getByLabel(branches.form.nameEn).fill(RENAMED);
    await editDialog.getByRole("button", { name: branches.form.save }).click();
    await expect(editDialog).toBeHidden();
    await expect(page.getByText(RENAMED).locator("visible=true").first()).toBeVisible();

    await page.getByText(RENAMED).locator("visible=true").first().click();
    await page.getByRole("dialog").getByRole("button", { name: branches.form.delete }).click();
    await page.getByRole("dialog").getByRole("button", { name: branches.confirm.delete }).click();
    await expect(page.getByText(RENAMED)).toHaveCount(0);
  });

  test("shows the server's reason when the last branch can't be deleted", async ({ page }) => {
    await signIn(page, "en", "owner");
    await page.goto("/dashboard/owner/branches");

    await page.getByText(SEEDED).locator("visible=true").first().click();
    await page.getByRole("dialog").getByRole("button", { name: branches.form.delete }).click();
    await page.getByRole("dialog").getByRole("button", { name: branches.confirm.delete }).click();
    await expect(page.getByText("A brand must keep at least one active branch.")).toBeVisible();
  });

  test("renders right-to-left in Arabic without sideways scroll", async ({ page }) => {
    await signIn(page, "ar", "owner");
    await page.goto("/dashboard/owner/branches");
    await expect(page.getByRole("heading", { level: 1, name: dictionaryFor("ar").branches.title })).toBeVisible();
    await expectNoHorizontalScroll(page);
  });
});

test.describe("new branch brand picker", () => {
  test.use({ storageState: E2E_ADMIN_STORAGE_STATE });

  test("offers approved brands only", async ({ page }) => {
    await signIn(page, "en", "admin");
    await page.goto("/dashboard/admin/branches");
    await page.getByRole("button", { name: branches.newBranch }).click();

    const brand = page.getByRole("dialog").getByLabel(branches.form.brand);
    await expect(brand.locator("option", { hasText: E2E_ASSIGNABLE_BRAND_NAME })).toHaveCount(1);
    await expect(brand.locator("option", { hasText: E2E_PENDING_BRAND_NAME })).toHaveCount(0);
  });
});

test.describe("owner whose brand awaits approval", () => {
  // Signs in through the form as the pending brand's owner, so no saved session.
  test.use({ storageState: { cookies: [], origins: [] } });

  test("is told to wait for approval instead of getting the branch form", async ({ page }) => {
    await page.goto("/dashboard/owner/login");
    await page.getByLabel(auth.email).fill(E2E_PENDING_OWNER_EMAIL);
    await page.getByLabel(auth.password, { exact: true }).fill(E2E_OWNER_PASSWORD);
    await page.getByRole("button", { name: auth.submit }).click();
    await expect(page).not.toHaveURL(/\/login/);

    await page.goto("/dashboard/owner/branches");
    await page.getByRole("button", { name: branches.newBranch }).first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText(branches.form.awaitingApproval.title)).toBeVisible();
    await expect(dialog.getByLabel(branches.form.nameEn)).toHaveCount(0);
    // The notice carries its own Close; the dialog's corner button has the same name.
    await dialog.getByRole("status").getByRole("button", { name: dictionaryFor("en").common.close }).click();
    await expect(dialog).toBeHidden();
  });
});
