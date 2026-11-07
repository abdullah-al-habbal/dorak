import { expect, test } from "@playwright/test";

import { dictionaryFor, expectNoHorizontalScroll, signIn } from "@tests/e2e/support/sign-in";

const en = dictionaryFor("en").reviews;
const ar = dictionaryFor("ar").reviews;

test.describe("reviews", () => {
  test("shows the rating summary and the review list", async ({ page }) => {
    await signIn(page);
    await page.goto("/dashboard/manager/reviews");
    await expect(page.getByRole("heading", { level: 1, name: en.title })).toBeVisible();

    // Seeded: 5, 4 and 2 stars count (average 3.7); the disputed 1-star review is listed but not counted.
    await expect(page.getByTestId("rating-average")).toHaveText("3.7");
    await expect(page.getByText(en.summary.count.replace("{count}", "3"))).toBeVisible();
    await expect(page.getByText("Excellent cut and a friendly team.")).toBeVisible();
    await expect(page.getByText("Disputed by the branch.")).toBeVisible();
    await expect(page.getByText(en.status.disputed, { exact: true })).toBeVisible();
    await expect(page.getByText(en.states.results.replace("{count}", "4"))).toBeVisible();
    await expectNoHorizontalScroll(page);
  });

  test("renders right-to-left in Arabic", async ({ page }) => {
    await signIn(page, "ar");
    await page.goto("/dashboard/manager/reviews");
    await expect(page.getByRole("heading", { level: 1, name: ar.title })).toBeVisible();
    await expect(page.getByText(ar.summary.average)).toBeVisible();
    await expectNoHorizontalScroll(page);
  });
});
