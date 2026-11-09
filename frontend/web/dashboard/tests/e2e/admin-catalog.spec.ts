import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { E2E_ADMIN_STORAGE_STATE, E2E_OWNER_STORAGE_STATE } from "@tests/e2e/support/e2e-env.constant";
import { dictionaryFor, expectNoHorizontalScroll, resetBackend, signIn } from "@tests/e2e/support/sign-in";

const en = dictionaryFor("en");
const ar = dictionaryFor("ar");
const t = en.adminCatalog;
const CATALOG = "/dashboard/admin/catalog";
/** Seeded by `E2eDashboardSeeder`: two categories with one service each, and one empty category every reset restores. */
const HAIR = "Hair";
const EMPTY = "E2E Empty Category";
/** `E2eDashboardSeeder::CATALOG_SPEC_NAME_PREFIX`: categories named like this are removed on every reset. */
const NEW_CATEGORY = "E2E Spec Scalp care";

function visibleText(page: Page, text: string) {
  return page.getByText(text, { exact: true }).locator("visible=true").first();
}

function results(count: number): string {
  return t.states.results.replace("{count}", String(count));
}

test.describe("admin catalog", () => {
  test.use({ storageState: E2E_ADMIN_STORAGE_STATE });

  test.afterEach(async () => {
    await resetBackend();
  });

  test("lists the seeded categories, then filters by status and search", async ({ page }) => {
    await signIn(page, "en", "admin");
    await page.goto(CATALOG);
    await expect(page.getByRole("heading", { level: 1, name: t.title })).toBeVisible();
    await expect(page.getByText(t.deactivateNote)).toBeVisible();
    await expect(page.getByText(results(3))).toBeVisible();
    await expect(visibleText(page, EMPTY)).toBeVisible();
    await expectNoHorizontalScroll(page);

    await page.getByLabel(t.filters.status).selectOption("inactive");
    await expect(page).toHaveURL(/status=inactive/);
    await expect(page.getByText(t.states.filteredTitle)).toBeVisible();
    await page.getByRole("button", { name: t.filters.clear }).click();
    await expect(page).toHaveURL(new RegExp(`${CATALOG}$`));

    await page.getByRole("searchbox", { name: t.filters.search }).fill("Beard");
    await expect(page).toHaveURL(/search=Beard/);
    await expect(page.getByText(results(1))).toBeVisible();
  });

  test("validates, then creates a category", async ({ page }) => {
    await signIn(page, "en", "admin");
    await page.goto(CATALOG);
    await page.getByRole("button", { name: t.newCategory }).click();

    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: t.form.create }).click();
    await expect(dialog.getByText(t.form.validation.name).first()).toBeVisible();

    await dialog.getByLabel(t.form.nameEn).fill(NEW_CATEGORY);
    await dialog.getByLabel(t.form.nameAr).fill("العناية بفروة الرأس");
    await dialog.getByLabel(t.form.universe).selectOption("women");
    await dialog.getByRole("button", { name: t.form.create }).click();
    await expect(dialog).toBeHidden();

    await expect(page.getByText(results(4))).toBeVisible();
    await expect(visibleText(page, NEW_CATEGORY)).toBeVisible();
    await expect(visibleText(page, t.universe.women)).toBeVisible();
  });

  test("refuses a duplicate name inline", async ({ page }) => {
    await signIn(page, "en", "admin");
    await page.goto(CATALOG);
    await page.getByRole("button", { name: t.newCategory }).click();

    const dialog = page.getByRole("dialog");
    await dialog.getByLabel(t.form.nameEn).fill(HAIR);
    await dialog.getByLabel(t.form.nameAr).fill("اسم جديد");
    await dialog.getByRole("button", { name: t.form.create }).click();
    await expect(dialog.getByLabel(t.form.nameEn)).toHaveAttribute("aria-invalid", "true");
    await expect(dialog).toBeVisible();
  });

  test("shows a category's figures and read-only items, then edits it", async ({ page }) => {
    await signIn(page, "en", "admin");
    await page.goto(CATALOG);

    await page.getByRole("button", { name: t.rowLabel.replace("{category}", HAIR) }).locator("visible=true").first().click();
    const detail = page.getByRole("dialog");
    await expect(detail.getByRole("heading", { name: HAIR })).toBeVisible();
    await expect(detail.getByText(t.detail.itemsHint)).toBeVisible();
    await expect(detail.getByText(t.detail.noItems)).toBeVisible();
    await expect(detail.getByText(t.detail.noSubcategories)).toBeVisible();

    await detail.getByRole("button", { name: t.edit }).click();
    const form = page.getByRole("dialog");
    await expect(form.getByLabel(t.form.nameAr)).toHaveValue("الشعر");
    // Hair has a service, so it can't be deleted: the reason replaces the button.
    await expect(form.getByText(t.form.deleteBlocked)).toBeVisible();
    await expect(form.getByRole("button", { name: t.form.delete })).toHaveCount(0);
    await form.getByLabel(t.form.descriptionEn).fill("Cuts and styling");
    await form.getByRole("button", { name: t.form.save }).click();
    await expect(form).toBeHidden();
    await expect(page.getByText(t.toast.updated)).toBeVisible();
  });

  test("deactivates after a confirmation and reactivates at once", async ({ page }) => {
    await signIn(page, "en", "admin");
    await page.goto(CATALOG);

    const toggle = page.getByRole("switch", { name: t.toggle.deactivate.replace("{name}", EMPTY) }).locator("visible=true").first();
    await toggle.click();
    const confirm = page.getByRole("dialog");
    await expect(confirm.getByText(t.confirm.deactivateTitle)).toBeVisible();
    await expect(confirm.getByText(/stay visible to clients/)).toBeVisible();
    await confirm.getByRole("button", { name: t.confirm.deactivate }).click();
    await expect(page.getByText(t.toast.deactivated)).toBeVisible();

    await page.getByLabel(t.filters.status).selectOption("inactive");
    await expect(page.getByText(results(1))).toBeVisible();
    await page.getByRole("switch", { name: t.toggle.activate.replace("{name}", EMPTY) }).locator("visible=true").first().click();
    await expect(page.getByText(t.toast.activated)).toBeVisible();
    await expect(page.getByText(t.states.filteredTitle)).toBeVisible();
  });

  test("deletes an empty category", async ({ page }) => {
    await signIn(page, "en", "admin");
    await page.goto(CATALOG);

    await page.getByRole("button", { name: t.editAction.replace("{category}", EMPTY) }).locator("visible=true").first().click();
    await page.getByRole("dialog").getByRole("button", { name: t.form.delete }).click();
    await page.getByRole("dialog").getByRole("button", { name: t.confirm.delete }).click();
    await expect(page.getByText(t.toast.deleted)).toBeVisible();
    await expect(page.getByText(results(2))).toBeVisible();
  });

  test("renders right-to-left in Arabic", async ({ page }) => {
    await signIn(page, "ar", "admin");
    await page.goto(CATALOG);
    await expect(page.getByRole("heading", { level: 1, name: ar.adminCatalog.title })).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(visibleText(page, "الشعر")).toBeVisible();
    await expectNoHorizontalScroll(page);
  });

  test("follows the dark colour scheme", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await signIn(page, "en", "admin");
    await page.goto(CATALOG);
    await expect(page.getByRole("heading", { level: 1, name: t.title })).toBeVisible();
    await expect(page.locator("html")).toHaveClass(/dark/);
    await expectNoHorizontalScroll(page);
  });
});

test.describe("admin catalog access", () => {
  test.use({ storageState: E2E_OWNER_STORAGE_STATE });

  test("a brand owner sees the forbidden state", async ({ page }) => {
    await signIn(page, "en", "owner");
    await page.goto("/dashboard/owner/catalog");
    await expect(page.getByText(t.states.forbiddenTitle)).toBeVisible();
  });
});
