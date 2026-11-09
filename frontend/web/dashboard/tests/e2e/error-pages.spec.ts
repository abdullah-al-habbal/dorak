import { expect, request as playwrightRequest, test } from "@playwright/test";

import { E2E_APP_URL } from "@tests/e2e/support/e2e-env.constant";
import { dictionaryFor, signIn } from "@tests/e2e/support/sign-in";

const ar = dictionaryFor("ar");
const en = dictionaryFor("en");

test.describe("error pages", () => {
  test("serves the Arabic 404 right-to-left in the first HTML, before any script runs", async ({ page }) => {
    // A fresh context: the default one carries the saved session cookies, including its own locale.
    const anonymous = await playwrightRequest.newContext();
    const response = await anonymous.get(`${E2E_APP_URL}/no-such-page`, {
      headers: { Cookie: "NEXT_LOCALE=ar" },
      failOnStatusCode: false,
    });
    expect(response.status()).toBe(404);
    const html = await response.text();
    await anonymous.dispose();
    expect(html).toMatch(/<html[^>]*\blang="ar"[^>]*\bdir="rtl"/);

    await page.context().addCookies([{ name: "NEXT_LOCALE", value: "ar", url: E2E_APP_URL }]);
    await page.goto("/dashboard/manager/no-such-page");
    await expect(page.getByRole("heading", { level: 1, name: ar.errors.notFound.title })).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  });

  test("keeps the navigation and offers a retry when a portal screen crashes", async ({ page }) => {
    await signIn(page, "en");
    await expect(page.getByRole("banner")).toBeVisible();

    // Break number formatting after the shell is up, then navigate on the client to a screen that formats a rating.
    await page.evaluate(() => {
      Intl.NumberFormat = function () {
        throw new Error("forced portal error");
      } as unknown as typeof Intl.NumberFormat;
    });
    await page.evaluate(() => {
      (window as unknown as { next: { router: { push: (href: string) => void } } }).next.router.push("/dashboard/manager/reviews");
    });

    await expect(page.getByRole("alert").getByRole("heading", { level: 1, name: en.errors.generic.title })).toBeVisible();
    await expect(page.getByRole("button", { name: en.common.retry })).toBeVisible();
    await expect(page.getByRole("banner")).toBeVisible();
  });
});
