import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

import { dictionaryFor, expectNoHorizontalScroll, resetBackend, signIn } from "@tests/e2e/support/sign-in";

const { workingHours } = dictionaryFor("en");
const arabic = dictionaryFor("ar");

/** One day's row, so "Add shift" and the fields are not confused with other days. */
function dayRow(page: Page, day: string): Locator {
  return page.getByRole("listitem").filter({ has: page.getByRole("switch", { name: day }) });
}

async function openPage(page: Page, locale: "en" | "ar" = "en"): Promise<void> {
  await signIn(page, locale);
  await page.goto("/dashboard/manager/working-hours");
  await expect(page.getByRole("heading", { level: 1, name: dictionaryFor(locale).workingHours.title })).toBeVisible();
}

test.describe("working hours", () => {
  test.beforeEach(async () => {
    await resetBackend();
  });

  test("lists the seven days without sideways scroll", async ({ page }) => {
    await openPage(page);
    await expect(page.getByRole("switch")).toHaveCount(7);
    await expect(page.getByText(workingHours.notConfigured)).toBeVisible();
    await expectNoHorizontalScroll(page);
  });

  test("saves a split day and keeps both shifts after a reload", async ({ page }) => {
    await openPage(page);
    await page.getByRole("switch", { name: "Monday" }).click();
    await dayRow(page, "Monday").getByRole("button", { name: workingHours.addShift }).click();
    await page.getByLabel(`Monday, ${workingHours.shift.replace("{number}", "1")}: ${workingHours.closesAt}`).fill("13:00");
    await page.getByLabel(`Monday, ${workingHours.shift.replace("{number}", "2")}: ${workingHours.opensAt}`).fill("16:00");
    await page.getByLabel(`Monday, ${workingHours.shift.replace("{number}", "2")}: ${workingHours.closesAt}`).fill("22:00");
    await expect(page.getByText(workingHours.unsaved)).toBeVisible();

    await page.getByRole("button", { name: workingHours.save }).click();
    await expect(page.getByText(workingHours.toast.saved)).toBeVisible();

    await page.reload();
    await expect(page.getByLabel(`Monday, ${workingHours.shift.replace("{number}", "2")}: ${workingHours.closesAt}`)).toHaveValue("22:00");
    await expect(page.getByText(workingHours.notConfigured)).toBeHidden();
  });

  test("blocks saving while shifts overlap", async ({ page }) => {
    await openPage(page);
    await page.getByRole("switch", { name: "Tuesday" }).click();
    await dayRow(page, "Tuesday").getByRole("button", { name: workingHours.addShift }).click();
    await page.getByLabel(`Tuesday, ${workingHours.shift.replace("{number}", "2")}: ${workingHours.opensAt}`).fill("12:00");
    await expect(page.getByText(workingHours.issues.overlap)).toBeVisible();
    await expect(page.getByRole("button", { name: workingHours.save })).toBeDisabled();
  });

  test("copies a day onto other days and discards the draft", async ({ page }) => {
    await openPage(page);
    await page.getByRole("switch", { name: "Wednesday" }).click();
    await page.getByRole("button", { name: workingHours.copy.action.replace("{day}", "Wednesday") }).click();
    await page.getByRole("checkbox", { name: "Thursday" }).check();
    await page.getByRole("button", { name: workingHours.copy.apply, exact: true }).click();
    await expect(page.getByRole("switch", { name: "Thursday" })).toBeChecked();

    await page.getByRole("button", { name: workingHours.discard }).click();
    await expect(page.getByRole("switch", { name: "Thursday" })).not.toBeChecked();
  });

  test("renders right-to-left with Arabic copy and a Saturday-first week", async ({ page }) => {
    await openPage(page, "ar");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.getByRole("switch").first()).toHaveAccessibleName(/السبت/);
    await expect(page.getByRole("button", { name: arabic.workingHours.save })).toBeVisible();
    await expectNoHorizontalScroll(page);
  });
});
