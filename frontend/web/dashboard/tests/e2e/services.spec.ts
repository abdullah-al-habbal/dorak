import { expect, test } from "@playwright/test";

import { dictionaryFor, expectNoHorizontalScroll, resetBackend, signIn } from "@tests/e2e/support/sign-in";

const { services } = dictionaryFor("en");

const HAIRCUT = "Classic haircut";

test.describe("services", () => {
  test.afterEach(async () => {
    await resetBackend();
  });

  test("groups services by category", async ({ page }) => {
    await signIn(page);
    await page.goto("/dashboard/manager/services");
    await expect(page.getByRole("heading", { level: 1, name: services.title })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Hair" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Beard" })).toBeVisible();
    await expect(page.getByText("Classic haircut").locator("visible=true").first()).toBeVisible();
    await expectNoHorizontalScroll(page);
  });

  test("offers the category selector and an inline new-category form", async ({ page }) => {
    await signIn(page);
    await page.goto("/dashboard/manager/services");
    await page.getByRole("button", { name: services.newService }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByLabel(services.form.category)).toContainText("Hair");
    await dialog.getByRole("button", { name: services.form.newCategory }).click();
    await expect(dialog.getByLabel(services.form.newCategoryNameEn)).toBeVisible();
    await expect(dialog.getByLabel(services.form.newCategoryNameAr)).toBeVisible();
  });

  test("deactivates and reactivates a service from its switch", async ({ page }) => {
    await signIn(page);
    await page.goto("/dashboard/manager/services");

    await page.getByRole("switch", { name: services.toggle.deactivate.replace("{name}", HAIRCUT) }).locator("visible=true").first().click();
    await expect(page.getByText(services.toast.deactivated)).toBeVisible();
    const activate = page.getByRole("switch", { name: services.toggle.activate.replace("{name}", HAIRCUT) }).locator("visible=true").first();
    await expect(activate).not.toBeChecked();

    await activate.click();
    await expect(page.getByText(services.toast.activated)).toBeVisible();
    await expect(page.getByRole("switch", { name: services.toggle.deactivate.replace("{name}", HAIRCUT) }).locator("visible=true").first()).toBeChecked();
  });
});
