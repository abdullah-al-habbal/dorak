import { expect, test } from "@playwright/test";

import { dictionaryFor, expectNoHorizontalScroll, resetBackend, signIn } from "@tests/e2e/support/sign-in";

const { chairs } = dictionaryFor("en");
const NEW_LABEL = "E2E Window Seat";

test.describe("chairs", () => {
  test.afterEach(async () => {
    await resetBackend();
  });

  test("lists the seeded chairs and filters by status", async ({ page }) => {
    await signIn(page);
    await page.goto("/dashboard/manager/chairs");
    await expect(page.getByRole("heading", { level: 1, name: chairs.title })).toBeVisible();
    await expect(page.getByText("Chair 1").locator("visible=true").first()).toBeVisible();
    await expect(page.getByText("Chair 2").locator("visible=true").first()).toBeVisible();
    await expectNoHorizontalScroll(page);

    await page.getByLabel(chairs.filters.status).selectOption("maintenance");
    await expect(page).toHaveURL(/status=maintenance/);
    await expect(page.getByText(chairs.states.filteredTitle)).toBeVisible();
    await page.getByRole("button", { name: chairs.filters.clear }).first().click();
    await expect(page.getByText("Chair 1").locator("visible=true").first()).toBeVisible();
  });

  test("creates a chair, moves it to maintenance and deletes it", async ({ page }) => {
    await signIn(page);
    await page.goto("/dashboard/manager/chairs");

    await page.getByRole("button", { name: chairs.newChair }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: chairs.form.create }).click();
    await expect(dialog.getByText(chairs.form.validation.label)).toBeVisible();

    await dialog.getByLabel(chairs.form.label).fill(NEW_LABEL);
    await dialog.getByLabel(chairs.form.zone).selectOption("women");
    await dialog.getByRole("button", { name: chairs.form.create }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByText(NEW_LABEL).locator("visible=true").first()).toBeVisible();

    await page.getByRole("switch", { name: chairs.toggle.maintenance.replace("{name}", NEW_LABEL) }).locator("visible=true").first().click();
    await expect(page.getByRole("switch", { name: chairs.toggle.inService.replace("{name}", NEW_LABEL) }).locator("visible=true").first()).toBeVisible();

    await page.getByText(NEW_LABEL).locator("visible=true").first().click();
    await page.getByRole("dialog").getByRole("button", { name: chairs.form.delete }).click();
    await page.getByRole("dialog").getByRole("button", { name: chairs.confirm.delete }).click();
    await expect(page.getByText(NEW_LABEL)).toHaveCount(0);
  });

  test("renders right-to-left in Arabic without sideways scroll", async ({ page }) => {
    await signIn(page, "ar");
    await page.goto("/dashboard/manager/chairs");
    await expect(page.getByRole("heading", { level: 1, name: dictionaryFor("ar").chairs.title })).toBeVisible();
    await expectNoHorizontalScroll(page);
  });
});
