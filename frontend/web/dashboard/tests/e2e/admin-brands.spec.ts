import { expect, test } from "@playwright/test";

import { E2E_ADMIN_STORAGE_STATE, E2E_OWNER_STORAGE_STATE } from "@tests/e2e/support/e2e-env.constant";
import { dictionaryFor, expectNoHorizontalScroll, resetBackend, signIn } from "@tests/e2e/support/sign-in";

const en = dictionaryFor("en");
const ar = dictionaryFor("ar");
const t = en.adminBrands;
const BRANDS = "/dashboard/admin/brands";
/** Seeded by `E2eDashboardSeeder::pendingBrand()`, put back to pending on every reset. */
const PENDING_BRAND = "E2E Pending Cuts";
const PENDING_OWNER = "e2e-pending-owner@dorak.test";

test.describe("admin brands", () => {
  test.use({ storageState: E2E_ADMIN_STORAGE_STATE });

  // Every viewport project approves the same seeded brand, so each test starts from the pending baseline.
  test.beforeEach(async () => {
    await resetBackend();
  });

  test("opens on the pending queue and lists the seeded pending brand", async ({ page }) => {
    await signIn(page, "en", "admin");
    await page.goto(BRANDS);
    await expect(page.getByRole("heading", { level: 1, name: t.title })).toBeVisible();
    await expect(page.getByLabel(t.filters.status)).toHaveValue("pending");
    await expect(page.getByText(PENDING_BRAND, { exact: true }).locator("visible=true").first()).toBeVisible();
    await expect(page.getByText(t.states.results.replace("{count}", "1"))).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`${BRANDS}$`));
    await expectNoHorizontalScroll(page);
  });

  test("lists every status, searches by name and clears back to the queue", async ({ page }) => {
    await signIn(page, "en", "admin");
    await page.goto(BRANDS);

    await page.getByLabel(t.filters.status).selectOption("all");
    await expect(page).toHaveURL(/status=all/);
    await expect(page.getByText(t.status.active, { exact: true }).locator("visible=true").first()).toBeVisible();

    await page.getByRole("searchbox", { name: t.filters.search }).fill("Pending Cuts");
    await expect(page).toHaveURL(/search=Pending\+Cuts/);
    await expect(page.getByText(t.states.results.replace("{count}", "1"))).toBeVisible();

    await page.getByRole("searchbox", { name: t.filters.search }).fill("no brand has this name");
    await expect(page.getByText(t.states.filteredTitle)).toBeVisible();
    await page.getByRole("button", { name: t.filters.clear }).click();
    await expect(page).toHaveURL(new RegExp(`${BRANDS}$`));
    await expect(page.getByText(PENDING_BRAND, { exact: true }).locator("visible=true").first()).toBeVisible();
  });

  test("shows a brand's details and approves it from there", async ({ page }) => {
    await signIn(page, "en", "admin");
    await page.goto(BRANDS);

    await page.getByRole("button", { name: t.rowLabel.replace("{brand}", PENDING_BRAND) }).locator("visible=true").first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("heading", { name: PENDING_BRAND })).toBeVisible();
    await expect(dialog.getByText(PENDING_OWNER)).toBeVisible();
    await expect(dialog.getByText("USD")).toBeVisible();

    await dialog.getByRole("button", { name: t.approve }).click();
    await expect(dialog.getByRole("heading", { name: t.confirm.title })).toBeVisible();
    await dialog.getByRole("button", { name: t.confirm.confirm }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByText(t.toast.approved)).toBeVisible();
    await expect(page.getByText(t.states.emptyTitle)).toBeVisible();

    await page.getByLabel(t.filters.status).selectOption("active");
    await expect(page.getByText(PENDING_BRAND, { exact: true }).locator("visible=true").first()).toBeVisible();
  });

  test("approves from the row after confirming, and cancelling keeps it pending", async ({ page }) => {
    await signIn(page, "en", "admin");
    await page.goto(BRANDS);
    const approve = page.getByRole("button", { name: t.rowAction.replace("{brand}", PENDING_BRAND) });

    await approve.click();
    await page.getByRole("dialog").getByRole("button", { name: en.common.cancel }).click();
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(approve).toBeVisible();

    await approve.click();
    await page.getByRole("dialog").getByRole("button", { name: t.confirm.confirm }).click();
    await expect(page.getByText(t.toast.approved)).toBeVisible();
    await expect(approve).toHaveCount(0);
  });

  test("renders right-to-left in Arabic", async ({ page }) => {
    await signIn(page, "ar", "admin");
    await page.goto(BRANDS);
    await expect(page.getByRole("heading", { level: 1, name: ar.adminBrands.title })).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expectNoHorizontalScroll(page);
  });

  test("follows the dark colour scheme", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await signIn(page, "en", "admin");
    await page.goto(BRANDS);
    await expect(page.getByRole("heading", { level: 1, name: t.title })).toBeVisible();
    await expect(page.locator("html")).toHaveClass(/dark/);
    await expectNoHorizontalScroll(page);
  });
});

test.describe("brands for a brand owner", () => {
  test.use({ storageState: E2E_OWNER_STORAGE_STATE });

  test("shows the forbidden state instead of the approval queue", async ({ page }) => {
    await signIn(page, "en", "owner");
    await page.goto("/dashboard/owner/brands");
    await expect(page.getByText(t.states.forbiddenTitle)).toBeVisible();
    await expect(page.getByRole("button", { name: t.rowAction.replace("{brand}", PENDING_BRAND) })).toHaveCount(0);
  });
});
