import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { dictionaryFor, expectNoHorizontalScroll, signIn } from "@tests/e2e/support/sign-in";

const { bookings, common } = dictionaryFor("en");
const BOOKINGS_API = "/api/dashboard/bookings";
const HISTORY_API = /^\/api\/dashboard\/bookings\/[^/]+\/history$/;

/** Holds every request whose path matches until the returned release function is called. */
async function holdRequests(page: Page, matches: (pathname: string) => boolean): Promise<() => void> {
  let release: () => void = () => undefined;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route((url) => matches(url.pathname), async (route) => {
    await gate;
    await route.continue();
  });
  return release;
}

test.describe("bookings", () => {
  test("shows today's bookings without sideways scroll", async ({ page }) => {
    await signIn(page);
    await page.goto("/dashboard/manager/bookings");
    await expect(page.getByRole("heading", { level: 1, name: bookings.title })).toBeVisible();
    await expect(page.getByText("Sami Khoury").locator("visible=true").first()).toBeVisible();
    await expect(page.getByText("Nadia Farah").locator("visible=true").first()).toBeVisible();
    await expectNoHorizontalScroll(page);
  });

  test("shows skeleton rows while the list loads, then the bookings and their history", async ({ page }) => {
    await signIn(page);
    const releaseList = await holdRequests(page, (pathname) => pathname === BOOKINGS_API);
    await page.goto("/dashboard/manager/bookings?view=list");

    const loading = page.getByRole("status", { name: common.loading });
    await expect(loading.first()).toBeVisible();
    releaseList();

    const row = page.getByRole("button", { name: /^Sami Khoury, / }).locator("visible=true").first();
    await expect(row).toBeVisible();
    await expect(page.getByText("Nadia Farah").locator("visible=true").first()).toBeVisible();
    await expect(loading).toHaveCount(0);

    const releaseHistory = await holdRequests(page, (pathname) => HISTORY_API.test(pathname));
    await row.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("heading", { name: bookings.history.title })).toBeVisible();
    await expect(dialog.getByRole("status", { name: common.loading })).toBeVisible();
    releaseHistory();
    await expect(dialog.getByRole("status", { name: common.loading })).toHaveCount(0);
  });
});
