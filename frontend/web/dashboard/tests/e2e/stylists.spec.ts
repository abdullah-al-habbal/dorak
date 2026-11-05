import { expect, test } from "@playwright/test";

import { dictionaryFor, expectNoHorizontalScroll, signIn } from "@tests/e2e/support/sign-in";

const { stylists } = dictionaryFor("en");

test.describe("stylists", () => {
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
});
