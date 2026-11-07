import { expect, test } from "@playwright/test";

import { E2E_BARBER_STORAGE_STATE, E2E_STORAGE_STATE } from "@tests/e2e/support/e2e-env.constant";
import { dictionaryFor, expectNoHorizontalScroll, signIn } from "@tests/e2e/support/sign-in";

const en = dictionaryFor("en").schedule;
const ar = dictionaryFor("ar").schedule;
const enShell = dictionaryFor("en").shell;

test.describe("barber schedule", () => {
  test.use({ storageState: E2E_BARBER_STORAGE_STATE });

  test("lists the barber's own appointments and weekly hours", async ({ page }) => {
    await signIn(page, "en", "barber");
    await page.goto("/dashboard/barber/schedule");
    await expect(page.getByRole("heading", { level: 1, name: en.title })).toBeVisible();

    // Seeded: Omar has one booking today (Sami Khoury, confirmed); Lina's booking must not leak in.
    await expect(page.getByText(en.states.results.replace("{count}", "1"))).toBeVisible();
    await expect(page.getByText("Sami Khoury").locator("visible=true").first()).toBeVisible();
    await expect(page.getByText("Nadia Farah")).toHaveCount(0);

    // Seeded hours: Monday to Wednesday work, Thursday is switched off, Friday to Sunday are days off.
    const hours = page.getByTestId("schedule-hours");
    await expect(hours.getByText(en.hours.dayOff)).toHaveCount(4);
    await expect(hours.getByText("9:00 AM to 1:00 PM")).toBeVisible();
    await expect(hours.getByText("10:00 AM to 4:00 PM")).toBeVisible();
    await expect(hours.getByText("9:00 AM to 5:00 PM")).toHaveCount(1);
    await expectNoHorizontalScroll(page);
  });

  test("opens from the sidebar as a ready item", async ({ page }) => {
    await signIn(page, "en", "barber");
    const link = page.getByRole("link", { name: enShell.nav.schedule }).locator("visible=true").first();
    if (await link.isVisible()) {
      await link.click();
      await expect(page).toHaveURL(/\/dashboard\/barber\/schedule$/);
    } else {
      await page.goto("/dashboard/barber/schedule");
    }
    await expect(page.getByRole("heading", { level: 1, name: en.title })).toBeVisible();
    await expect(page.getByText(enShell.soon)).toHaveCount(0);
  });

  test("filters by status and range, keeps them in the URL and clears them", async ({ page }) => {
    await signIn(page, "en", "barber");
    await page.goto("/dashboard/barber/schedule");
    await expect(page.getByText(en.states.results.replace("{count}", "1"))).toBeVisible();

    await page.getByLabel(en.filters.status).selectOption("completed");
    await expect(page).toHaveURL(/status=completed/);
    await expect(page.getByText(en.states.filteredTitle)).toBeVisible();

    await page.getByRole("button", { name: en.filters.clear }).click();
    await expect(page).not.toHaveURL(/status=/);
    await expect(page.getByText(en.states.results.replace("{count}", "1"))).toBeVisible();

    await page.getByRole("button", { name: en.range.today }).click();
    await expect(page).toHaveURL(/range=today/);
    await expect(page.getByRole("button", { name: en.range.today })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText(en.states.results.replace("{count}", "1"))).toBeVisible();
  });

  test("renders right-to-left in Arabic", async ({ page }) => {
    await signIn(page, "ar", "barber");
    await page.goto("/dashboard/barber/schedule");
    await expect(page.getByRole("heading", { level: 1, name: ar.title })).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.getByText(ar.hours.dayOff).first()).toBeVisible();
    await expect(page.getByText(ar.states.results.replace("{count}", "1"))).toBeVisible();
    await expectNoHorizontalScroll(page);
  });

  test("follows the dark colour scheme", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await signIn(page, "en", "barber");
    await page.goto("/dashboard/barber/schedule");
    await expect(page.getByRole("heading", { level: 1, name: en.title })).toBeVisible();
    await expect(page.locator("html")).toHaveClass(/dark/);
    await expectNoHorizontalScroll(page);
  });
});

test.describe("schedule access", () => {
  test.use({ storageState: E2E_STORAGE_STATE });

  test("shows the forbidden state to a branch manager", async ({ page }) => {
    await signIn(page);
    await page.goto("/dashboard/manager/schedule");
    await expect(page.getByText(en.states.forbiddenTitle)).toBeVisible();
  });
});
