import { expect, test } from "@playwright/test";

import { dictionaryFor, expectNoHorizontalScroll, signIn } from "@tests/e2e/support/sign-in";

const ar = dictionaryFor("ar");

test.describe("arabic / rtl", () => {
  test("renders the portal right-to-left with Arabic copy", async ({ page }) => {
    await signIn(page, "ar");
    await page.goto("/dashboard/manager/services");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page.getByRole("heading", { level: 1, name: ar.services.title })).toBeVisible();
    await expectNoHorizontalScroll(page);
  });

  test("keeps the stylists directory inside the viewport in rtl", async ({ page }) => {
    await signIn(page, "ar");
    await page.goto("/dashboard/manager/stylists");
    await expect(page.getByRole("heading", { level: 1, name: ar.stylists.title })).toBeVisible();
    await expectNoHorizontalScroll(page);
  });
});
