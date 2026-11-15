import { expect, test } from "@playwright/test";

import { E2E_OWNER_STORAGE_STATE } from "@tests/e2e/support/e2e-env.constant";
import { dictionaryFor, expectNoHorizontalScroll, resetBackend, signIn } from "@tests/e2e/support/sign-in";

const { services } = dictionaryFor("en");

const HAIRCUT = "Classic haircut";
const SERVICES = "/dashboard/manager/services";
const OWNER_SERVICES = "/dashboard/owner/services";
const BOOKINGS = "/dashboard/manager/bookings";

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

  test("shows the manager the services read-only (F-07)", async ({ page }) => {
    await signIn(page);
    await page.goto(SERVICES);
    await expect(page.getByText(HAIRCUT).locator("visible=true").first()).toBeVisible();
    await expect(page.getByRole("button", { name: services.newService })).toHaveCount(0);
    await expect(page.getByRole("switch", { name: services.toggle.deactivate.replace("{name}", HAIRCUT) }).locator("visible=true").first()).toBeDisabled();
  });

  test.describe("as the brand owner", () => {
    test.use({ storageState: E2E_OWNER_STORAGE_STATE });

      test("offers the owner a category selector without an inline new-category form (F-02)", async ({ page }) => {
        await signIn(page, "en", "owner");
        await page.goto(OWNER_SERVICES);
        await page.getByRole("button", { name: services.newService }).click();
        const dialog = page.getByRole("dialog");
        await expect(dialog.getByLabel(services.form.category)).toContainText("Hair");
        await expect(dialog.getByRole("button", { name: /new category/i })).toHaveCount(0);
      });

      test("deactivates and reactivates a service from its switch", async ({ page }) => {
        await signIn(page, "en", "owner");
        await page.goto(OWNER_SERVICES);

        await page.getByRole("switch", { name: services.toggle.deactivate.replace("{name}", HAIRCUT) }).locator("visible=true").first().click();
        await expect(page.getByText(services.toast.deactivated)).toBeVisible();
        const activate = page.getByRole("switch", { name: services.toggle.activate.replace("{name}", HAIRCUT) }).locator("visible=true").first();
        await expect(activate).not.toBeChecked();

        await activate.click();
        await expect(page.getByText(services.toast.activated)).toBeVisible();
        await expect(page.getByRole("switch", { name: services.toggle.deactivate.replace("{name}", HAIRCUT) }).locator("visible=true").first()).toBeChecked();
      });
  });

  test("keeps the search in the URL, clears back to the bare path, and replaces history", async ({ page }) => {
    await signIn(page);
    await page.goto(BOOKINGS);
    await page.goto(SERVICES);
    // Wait for the data (and so hydration) before typing, or the change event is lost.
    await expect(page.getByText(HAIRCUT).locator("visible=true").first()).toBeVisible();
    const search = page.getByLabel(services.search);

    await search.fill("Classic haircut");
    await expect(page).toHaveURL(/\/dashboard\/manager\/services\?search=Classic\+haircut$/);
    await expect(page.getByRole("heading", { name: "Beard" })).toBeHidden();

    await search.fill("");
    await expect(page).toHaveURL(/\/dashboard\/manager\/services$/);

    // Search writes replace the entry, so Back leaves the screen instead of stepping through searches.
    await page.goBack();
    await expect(page).toHaveURL(/\/dashboard\/manager\/bookings$/);
  });
});
