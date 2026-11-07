import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { E2E_ADMIN_STORAGE_STATE } from "@tests/e2e/support/e2e-env.constant";
import { dictionaryFor, expectNoHorizontalScroll, resetBackend, signIn } from "@tests/e2e/support/sign-in";

const en = dictionaryFor("en");
const ar = dictionaryFor("ar");
const t = en.settings;
const SETTINGS = "/dashboard/admin/settings";
const GRACE = t.keys.subscription_grace_days.label;

/** The number field only: the per-field reset button repeats the label in its own name. */
function field(page: Page, label: string) {
  return page.getByRole("textbox", { name: new RegExp(`^${label}`) });
}

test.describe("admin settings", () => {
  test.use({ storageState: E2E_ADMIN_STORAGE_STATE });

  test.afterEach(async () => {
    await resetBackend();
  });

  test("lists every group with its default and allowed range", async ({ page }) => {
    await signIn(page, "en", "admin");
    await page.goto(SETTINGS);
    await expect(page.getByRole("heading", { level: 1, name: t.title })).toBeVisible();
    for (const group of Object.values(t.groups)) await expect(page.getByRole("heading", { level: 2, name: group.title })).toBeVisible();
    await expect(field(page, GRACE)).toBeVisible();
    await expect(page.getByRole("button", { name: t.actions.save })).toBeDisabled();
    await expectNoHorizontalScroll(page);
  });

  test("saves a change, keeps it after a reload, and resets a field to its default", async ({ page }) => {
    await signIn(page, "en", "admin");
    await page.goto(SETTINGS);
    const grace = field(page, GRACE);
    const original = await grace.inputValue();
    await grace.fill("9");
    await expect(page.getByText(t.actions.unsaved)).toBeVisible();
    await page.getByRole("button", { name: t.actions.save }).click();
    await expect(page.getByText(t.toast.saved)).toBeVisible();
    await expect(page.getByText(t.actions.saved)).toBeVisible();

    await page.reload();
    await expect(field(page, GRACE)).toHaveValue("9");

    await page.getByRole("button", { name: t.field.resetLabel.replace("{setting}", GRACE) }).click();
    await expect(field(page, GRACE)).toHaveValue(original);
    await page.getByRole("button", { name: t.actions.discard }).click();
    await expect(field(page, GRACE)).toHaveValue("9");
  });

  test("refuses out-of-range and cross-field values without saving", async ({ page }) => {
    await signIn(page, "en", "admin");
    await page.goto(SETTINGS);
    await field(page, GRACE).fill("999");
    await page.getByRole("button", { name: t.actions.save }).click();
    await expect(page.getByText(/^Enter a whole number from \d+ to \d+\.$/).first()).toBeVisible();

    await field(page, GRACE).fill("5");
    await field(page, t.keys.pagination_default_per_page.label).fill("90");
    await field(page, t.keys.pagination_max_per_page.label).fill("50");
    await page.getByRole("button", { name: t.actions.save }).click();
    await expect(page.getByText(t.validation.pageSize)).toBeVisible();
  });

  test("renders in Arabic, right to left", async ({ page }) => {
    await signIn(page, "ar", "admin");
    await page.goto(SETTINGS);
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.getByRole("heading", { level: 1, name: ar.settings.title })).toBeVisible();
    await expect(field(page, ar.settings.keys.subscription_grace_days.label)).toBeVisible();
    await expectNoHorizontalScroll(page);
  });
});

test.describe("settings for other guards", () => {
  test("a manager sees the forbidden state", async ({ page }) => {
    await signIn(page, "en", "manager");
    await page.goto("/dashboard/manager/settings");
    await expect(page.getByText(t.states.forbiddenTitle)).toBeVisible();
  });
});
