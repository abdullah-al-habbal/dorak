import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { E2E_APP_URL } from "@tests/e2e/support/e2e-env.constant";
import { dictionaryFor } from "@tests/e2e/support/sign-in";
import type { E2ELocale } from "@tests/e2e/support/sign-in";

/** Seeded by the base seeders and `E2eDashboardSeeder`: slugs come from the English name. */
const BRAND = { path: "/brands/dorak-demo", en: "Dorak Demo" };
const BRANCH = { path: "/branches/e2e-salon", en: "E2E Salon", ar: "صالون الاختبار" };
const STYLIST = { path: "/stylists/omar-haddad", en: "Omar Haddad", ar: "عمر حداد" };
const HIDDEN_STYLIST = "/stylists/lina-saad";
const MISSING = ["/brands/no-such-brand", "/branches/no-such-branch", "/stylists/no-such-stylist"];

async function openAs(page: Page, locale: E2ELocale, path: string): Promise<void> {
  await page.context().addCookies([{ name: "NEXT_LOCALE", value: locale, url: E2E_APP_URL }]);
  await page.goto(path);
}

test.describe("public profile pages", () => {
  // Visitors are signed out.
  test.use({ storageState: { cookies: [], origins: [] } });

  test("shows a brand, a branch and a stylist to a visitor, indexable and left-to-right in English", async ({ page }) => {
    for (const { path, en } of [BRAND, BRANCH, STYLIST]) {
      await openAs(page, "en", path);
      await expect(page.getByRole("heading", { level: 1, name: en })).toBeVisible();
      await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /\bindex\b/);
      await expect(page.locator('meta[name="robots"]')).not.toHaveAttribute("content", /noindex/);
      await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    }
  });

  test("lists the enabled stylist on the branch page and links to the stylist's page", async ({ page }) => {
    await openAs(page, "en", BRANCH.path);
    await expect(page.getByRole("link", { name: new RegExp(STYLIST.en) })).toHaveAttribute("href", STYLIST.path);
    await expect(page.getByText("Lina Saad")).toHaveCount(0);
  });

  test("renders the branch and the stylist right-to-left with Arabic copy", async ({ page }) => {
    const ar = dictionaryFor("ar").publicProfile;
    for (const { path, ar: name } of [BRANCH, STYLIST]) {
      await openAs(page, "ar", path);
      await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
      await expect(page.locator("html")).toHaveAttribute("lang", "ar");
      await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();
    }
    await openAs(page, "ar", BRANCH.path);
    await expect(page.getByRole("heading", { name: ar.hours })).toBeVisible();
  });

  test("answers a real HTTP 404 with the not-found screen for an unknown slug", async ({ page }) => {
    for (const path of MISSING) {
      const response = await page.goto(path);
      expect(response?.status(), path).toBe(404);
      await expect(page.getByRole("heading", { level: 1, name: dictionaryFor("en").errors.notFound.title })).toBeVisible();
      // Next adds its own noindex to a 404 beside the site-wide one.
      await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute("content", /noindex/);
    }
  });

  test("answers a real HTTP 404 for a stylist who is switched off, right-to-left in Arabic", async ({ page }) => {
    await page.context().addCookies([{ name: "NEXT_LOCALE", value: "ar", url: E2E_APP_URL }]);
    const response = await page.goto(HIDDEN_STYLIST);
    expect(response?.status()).toBe(404);
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.getByRole("heading", { level: 1, name: dictionaryFor("ar").errors.notFound.title })).toBeVisible();
  });

  test("fits a phone-width viewport without sideways scroll", async ({ page }) => {
    await openAs(page, "en", BRANCH.path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
