import { expect, test } from "@playwright/test";

const PUBLIC_ENTRY_PAGES = ["/dashboard/manager/login", "/register/business"];

test.describe("search engines", () => {
  // Public pages are visited signed out.
  test.use({ storageState: { cookies: [], origins: [] } });

  for (const path of PUBLIC_ENTRY_PAGES) {
    test(`${path} asks crawlers not to index or follow`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /nofollow/);
    });
  }
});
