import { expect, test } from "@playwright/test";

import { dictionaryFor, expectNoHorizontalScroll, signIn } from "@tests/e2e/support/sign-in";

const { bookings } = dictionaryFor("en");

test.describe("bookings", () => {
  test("shows today's bookings without sideways scroll", async ({ page }) => {
    await signIn(page);
    await page.goto("/dashboard/manager/bookings");
    await expect(page.getByRole("heading", { level: 1, name: bookings.title })).toBeVisible();
    await expect(page.getByText("Sami Khoury").locator("visible=true").first()).toBeVisible();
    await expect(page.getByText("Nadia Farah").locator("visible=true").first()).toBeVisible();
    await expectNoHorizontalScroll(page);
  });
});
