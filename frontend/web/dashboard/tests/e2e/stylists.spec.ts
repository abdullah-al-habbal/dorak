import { expect, test } from "@playwright/test";

import { dictionaryFor, expectNoHorizontalScroll, resetBackend, signIn } from "@tests/e2e/support/sign-in";

const { stylists } = dictionaryFor("en");

const LINA = "Lina Saad";

test.describe("stylists", () => {
  test.afterEach(async () => {
    await resetBackend();
  });

  test("lists the directory and opens the create dialog", async ({ page }) => {
    await signIn(page);
    await page.goto("/dashboard/manager/stylists");
    await expect(page.getByRole("heading", { level: 1, name: stylists.title })).toBeVisible();
    await expect(page.getByText("Omar Haddad").locator("visible=true").first()).toBeVisible();
    await expect(page.getByText("Lina Saad").locator("visible=true").first()).toBeVisible();
    await expectNoHorizontalScroll(page);
    await page.getByRole("button", { name: stylists.newStylist }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("activates a stylist optimistically and deactivates them after confirming", async ({ page }) => {
    await signIn(page);
    await page.goto("/dashboard/manager/stylists");

    await page.getByRole("switch", { name: stylists.toggle.activate.replace("{name}", LINA) }).locator("visible=true").first().click();
    await expect(page.getByText(stylists.toast.activated)).toBeVisible();
    const deactivate = page.getByRole("switch", { name: stylists.toggle.deactivate.replace("{name}", LINA) }).locator("visible=true").first();
    await expect(deactivate).toBeChecked();

    await deactivate.click();
    await page.getByRole("dialog").getByRole("button", { name: stylists.confirm.deactivate }).click();
    await expect(page.getByText(stylists.toast.deactivated)).toBeVisible();
    await expect(page.getByRole("switch", { name: stylists.toggle.activate.replace("{name}", LINA) }).locator("visible=true").first()).not.toBeChecked();
  });
});
