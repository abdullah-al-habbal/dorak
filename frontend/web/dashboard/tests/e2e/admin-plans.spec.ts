import { expect, test } from "@playwright/test";

import { E2E_ADMIN_STORAGE_STATE, E2E_OWNER_STORAGE_STATE } from "@tests/e2e/support/e2e-env.constant";
import { holdRequests } from "@tests/e2e/support/hold-requests";
import { dictionaryFor, expectNoHorizontalScroll, resetBackend, signIn } from "@tests/e2e/support/sign-in";

const en = dictionaryFor("en");
const ar = dictionaryFor("ar");
const t = en.plans;
const PLANS = "/dashboard/admin/plans";
const NEW_PLAN = "E2E Scale";
const FEATURE_KEYS_API = "/api/dashboard/admin/plan-feature-keys";

test.describe("admin plans", () => {
  test.use({ storageState: E2E_ADMIN_STORAGE_STATE });

  test.afterEach(async () => {
    await resetBackend();
  });

  test("lists the seeded plans and filters by status", async ({ page }) => {
    await signIn(page, "en", "admin");
    await page.goto(PLANS);
    await expect(page.getByRole("heading", { level: 1, name: t.title })).toBeVisible();
    await expect(page.getByText(t.states.results.replace("{count}", "2"))).toBeVisible();
    await expect(page.getByText("E2E Growth").locator("visible=true").first()).toBeVisible();
    await expectNoHorizontalScroll(page);

    await page.getByLabel(t.filters.state).selectOption("inactive");
    await expect(page).toHaveURL(/state=inactive/);
    await expect(page.getByText(t.states.results.replace("{count}", "1"))).toBeVisible();
    await expect(page.getByText("E2E Legacy").locator("visible=true").first()).toBeVisible();
  });

  test("shows skeleton rows in the plan form until its options load", async ({ page }) => {
    await signIn(page, "en", "admin");
    await page.goto(PLANS);
    const releaseOptions = await holdRequests(page, (pathname) => pathname === FEATURE_KEYS_API);
    await page.getByRole("button", { name: t.newPlan }).click();

    const dialog = page.getByRole("dialog");
    const loading = dialog.getByRole("status", { name: en.common.loading });
    await expect(loading).toBeVisible();
    await expect(dialog.getByRole("button", { name: t.form.create })).toHaveCount(0);
    releaseOptions();
    await expect(dialog.getByRole("button", { name: t.form.create })).toBeVisible();
    await expect(loading).toHaveCount(0);
  });

  test("validates, then creates a plan with a feature", async ({ page }) => {
    await signIn(page, "en", "admin");
    await page.goto(PLANS);
    await page.getByRole("button", { name: t.newPlan }).click();

    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: t.form.create }).click();
    await expect(dialog.getByText(t.form.validation.name).first()).toBeVisible();
    await expect(dialog.getByText(t.form.validation.price)).toBeVisible();

    await dialog.getByLabel(t.form.nameEn).fill(NEW_PLAN);
    await dialog.getByLabel(t.form.nameAr).fill("توسع الاختبار");
    await dialog.getByLabel(t.form.price, { exact: true }).fill("99.50");
    await dialog.getByLabel(en.subscription.features.labels.job_board).check();
    await dialog.getByRole("button", { name: t.form.create }).click();
    await expect(dialog).toBeHidden();

    await expect(page.getByText(t.states.results.replace("{count}", "3"))).toBeVisible();
    await expect(page.getByText(NEW_PLAN).locator("visible=true").first()).toBeVisible();
    await expect(page.getByText(en.subscription.features.labels.job_board).locator("visible=true").first()).toBeVisible();
  });

  test("edits a plan and activates it", async ({ page }) => {
    await signIn(page, "en", "admin");
    await page.goto(PLANS);
    await page.getByText("E2E Legacy").locator("visible=true").first().click();

    const dialog = page.getByRole("dialog");
    await expect(dialog.getByLabel(t.form.nameEn)).toHaveValue("E2E Legacy");
    await expect(dialog.getByLabel(t.form.nameAr)).toHaveValue("الخطة القديمة");
    await expect(dialog.getByLabel(t.form.price, { exact: true })).toHaveValue("29.00");
    await dialog.getByLabel(t.form.nameEn).fill("E2E Legacy Plus");
    await dialog.getByRole("switch", { name: t.form.active }).click();
    await dialog.getByRole("button", { name: t.form.save }).click();
    await expect(dialog).toBeHidden();

    await page.getByLabel(t.filters.state).selectOption("inactive");
    await expect(page.getByText(t.states.filteredTitle)).toBeVisible();
    await page.getByRole("button", { name: t.filters.clear }).first().click();
    await expect(page.getByText("E2E Legacy Plus").locator("visible=true").first()).toBeVisible();
  });

  test("deletes an unused plan but keeps one with a live subscription", async ({ page }) => {
    await signIn(page, "en", "admin");
    await page.goto(PLANS);

    await page.getByText("E2E Growth").locator("visible=true").first().click();
    await page.getByRole("dialog").getByRole("button", { name: t.form.delete }).click();
    await page.getByRole("dialog").getByRole("button", { name: t.confirm.delete }).click();
    // The backend refuses (409): its reason is shown, the confirm dialog stays open for a retry and the plan is still listed.
    await expect(page.getByText(t.confirm.deleteTitle)).toBeVisible();
    await page.getByRole("dialog").getByRole("button", { name: en.common.cancel }).click();
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(page.getByText("E2E Growth").locator("visible=true").first()).toBeVisible();

    await page.getByText("E2E Legacy").locator("visible=true").first().click();
    await page.getByRole("dialog").getByRole("button", { name: t.form.delete }).click();
    await page.getByRole("dialog").getByRole("button", { name: t.confirm.delete }).click();
    await expect(page.getByText(t.states.results.replace("{count}", "1"))).toBeVisible();
  });

  test("renders right-to-left in Arabic", async ({ page }) => {
    await signIn(page, "ar", "admin");
    await page.goto(PLANS);
    await expect(page.getByRole("heading", { level: 1, name: ar.plans.title })).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expectNoHorizontalScroll(page);
  });

  test("follows the dark colour scheme", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await signIn(page, "en", "admin");
    await page.goto(PLANS);
    await expect(page.getByRole("heading", { level: 1, name: t.title })).toBeVisible();
    await expect(page.locator("html")).toHaveClass(/dark/);
    await expectNoHorizontalScroll(page);
  });
});

test.describe("admin plans access", () => {
  test.use({ storageState: E2E_OWNER_STORAGE_STATE });

  test("a brand owner sees the forbidden state", async ({ page }) => {
    await signIn(page, "en", "owner");
    await page.goto("/dashboard/owner/plans");
    await expect(page.getByText(t.states.forbiddenTitle)).toBeVisible();
    await page.goto("/dashboard/owner/subscriptions");
    await expect(page.getByText(en.adminSubscriptions.states.forbiddenTitle)).toBeVisible();
  });
});
