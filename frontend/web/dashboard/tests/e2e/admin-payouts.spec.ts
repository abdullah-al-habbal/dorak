import { expect, test } from "@playwright/test";

import { E2E_ADMIN_STORAGE_STATE, E2E_STORAGE_STATE } from "@tests/e2e/support/e2e-env.constant";
import { holdRequests } from "@tests/e2e/support/hold-requests";
import { dictionaryFor, expectNoHorizontalScroll, resetBackend, signIn } from "@tests/e2e/support/sign-in";

const en = dictionaryFor("en");
const ar = dictionaryFor("ar");
const t = en.adminPayouts;
const PAYOUTS = "/dashboard/admin/payouts";
const ADMIN_PAYOUTS_API = "/api/dashboard/admin/payouts";

test.describe("admin payouts", () => {
  test.use({ storageState: E2E_ADMIN_STORAGE_STATE });

  test.afterEach(async () => {
    await resetBackend();
  });

  test("lists every payout, drafts included, with actions only where a move is allowed", async ({ page }) => {
    await signIn(page, "en", "admin");
    await page.goto(PAYOUTS);
    await expect(page.getByRole("heading", { level: 1, name: t.title })).toBeVisible();

    // Seeded: draft, approved, paid and cancelled.
    await expect(page.getByText(t.states.results.replace("{count}", "4"))).toBeVisible();
    await expect(page.getByRole("button", { name: new RegExp(`^${t.actions.approve}:`) })).toHaveCount(1);
    await expect(page.getByRole("button", { name: new RegExp(`^${t.actions["mark-paid"]}:`) })).toHaveCount(1);
    await expect(page.getByRole("button", { name: new RegExp(`^${t.actions.cancel}:`) })).toHaveCount(2);
    await expectNoHorizontalScroll(page);
  });

  test("filters by status and keeps it in the URL", async ({ page }) => {
    await signIn(page, "en", "admin");
    await page.goto(PAYOUTS);
    await page.getByLabel(t.filters.status).selectOption("draft");
    await expect(page).toHaveURL(/status=draft/);
    await expect(page.getByText(t.states.results.replace("{count}", "1"))).toBeVisible();
  });

  test("keeps the previous page on screen while a new filter loads", async ({ page }) => {
    await signIn(page, "en", "admin");
    await page.goto(PAYOUTS);
    await expect(page.getByText(t.states.results.replace("{count}", "4"))).toBeVisible();

    const release = await holdRequests(page, (pathname) => pathname === ADMIN_PAYOUTS_API);
    await page.getByLabel(t.filters.status).selectOption("draft");
    await expect(page.locator("[aria-busy=true]")).toBeVisible();
    await expect(page.getByText(t.states.results.replace("{count}", "4"))).toBeVisible();
    await expect(page.getByRole("status", { name: en.common.loading })).toHaveCount(0);

    release();
    await expect(page.getByText(t.states.results.replace("{count}", "1"))).toBeVisible();
    await expect(page.locator("[aria-busy=true]")).toHaveCount(0);
  });

  test("approves a draft payout", async ({ page }) => {
    await signIn(page, "en", "admin");
    await page.goto(`${PAYOUTS}?status=draft`);
    await page.getByRole("button", { name: new RegExp(`^${t.actions.approve}:`) }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("heading", { name: t.dialog.approve.title })).toBeVisible();
    await dialog.getByLabel(t.dialog.notes).fill("Checked by E2E");
    await dialog.getByRole("button", { name: t.dialog.approve.confirm }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByText(t.toast.approve)).toBeVisible();

    // The draft is gone from the draft filter and the approved list now holds two.
    await expect(page.getByText(t.states.filteredTitle)).toBeVisible();
    await page.getByLabel(t.filters.status).selectOption("approved");
    await expect(page.getByText(t.states.results.replace("{count}", "2"))).toBeVisible();
  });

  test("marks an approved payout as paid with a transfer reference", async ({ page }) => {
    await signIn(page, "en", "admin");
    await page.goto(`${PAYOUTS}?status=approved`);
    await page.getByRole("button", { name: new RegExp(`^${t.actions["mark-paid"]}:`) }).click();

    const dialog = page.getByRole("dialog");
    await dialog.getByLabel(t.dialog.reference).fill("E2E-REF-2");
    await dialog.getByRole("button", { name: t.dialog["mark-paid"].confirm }).click();
    await expect(dialog).toBeHidden();

    await page.goto(`${PAYOUTS}?status=paid`);
    await expect(page.getByText(t.states.results.replace("{count}", "2"))).toBeVisible();
    await expect(page.getByText("E2E-REF-2").locator("visible=true").first()).toBeVisible();
  });

  test("cancels a draft payout after confirming", async ({ page }) => {
    await signIn(page, "en", "admin");
    await page.goto(`${PAYOUTS}?status=draft`);
    await page.getByRole("button", { name: new RegExp(`^${t.actions.cancel}:`) }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("heading", { name: t.dialog.cancel.title })).toBeVisible();
    await dialog.getByRole("button", { name: t.dialog.back }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByText(t.states.results.replace("{count}", "1"))).toBeVisible();

    await page.getByRole("button", { name: new RegExp(`^${t.actions.cancel}:`) }).click();
    await page.getByRole("dialog").getByRole("button", { name: t.dialog.cancel.confirm }).click();
    await expect(page.getByRole("dialog")).toBeHidden();
    await page.goto(`${PAYOUTS}?status=cancelled`);
    await expect(page.getByText(t.states.results.replace("{count}", "2"))).toBeVisible();
  });

  test("generating drafts with nothing unsettled says so", async ({ page }) => {
    await signIn(page, "en", "admin");
    await page.goto(PAYOUTS);
    await page.getByRole("button", { name: t.generate }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("heading", { name: t.generateConfirm.title })).toBeVisible();
    await dialog.getByRole("button", { name: t.generateConfirm.confirm }).click();
    await expect(page.getByText(t.toast.nothingToGenerate)).toBeVisible();
  });

  test("renders right-to-left in Arabic", async ({ page }) => {
    await signIn(page, "ar", "admin");
    await page.goto(PAYOUTS);
    await expect(page.getByRole("heading", { level: 1, name: ar.adminPayouts.title })).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expectNoHorizontalScroll(page);
  });

  test("follows the dark colour scheme", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await signIn(page, "en", "admin");
    await page.goto(PAYOUTS);
    await expect(page.getByRole("heading", { level: 1, name: t.title })).toBeVisible();
    await expect(page.locator("html")).toHaveClass(/dark/);
    await expectNoHorizontalScroll(page);
  });
});

test.describe("admin payouts access", () => {
  test.use({ storageState: E2E_STORAGE_STATE });

  test("a branch manager keeps the forbidden state", async ({ page }) => {
    await signIn(page);
    await page.goto("/dashboard/manager/payouts");
    await expect(page.getByText(en.payouts.states.forbiddenTitle)).toBeVisible();
    await expect(page.getByRole("button", { name: t.generate })).toHaveCount(0);
  });
});
