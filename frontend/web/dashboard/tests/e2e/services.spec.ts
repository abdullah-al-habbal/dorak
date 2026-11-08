import { expect, test } from "@playwright/test";

import { HttpMethod } from "@/enums/http-method.enum";
import { HttpStatus } from "@/enums/http-status.enum";
import { dictionaryFor, expectNoHorizontalScroll, resetBackend, signIn } from "@tests/e2e/support/sign-in";

const { services } = dictionaryFor("en");

const HAIRCUT = "Classic haircut";
const CATEGORIES_API = "/api/dashboard/service-categories";
const CATEGORY_NAME_ERROR = "That category name is already taken.";

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

  test("offers the category selector and an inline new-category form", async ({ page }) => {
    await signIn(page);
    await page.goto("/dashboard/manager/services");
    await page.getByRole("button", { name: services.newService }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByLabel(services.form.category)).toContainText("Hair");
    await dialog.getByRole("button", { name: services.form.newCategory }).click();
    await expect(dialog.getByLabel(services.form.newCategoryNameEn)).toBeVisible();
    await expect(dialog.getByLabel(services.form.newCategoryNameAr)).toBeVisible();
  });

  test("shows the first field error, then the generic copy, when a new category is refused", async ({ page }) => {
    await signIn(page);
    let refusal: number = HttpStatus.Unprocessable;
    await page.route(
      (url) => url.pathname === CATEGORIES_API,
      async (route) => {
        if (route.request().method() !== HttpMethod.Post) return route.fallback();
        const fields = refusal === HttpStatus.Unprocessable ? { "name.en": [CATEGORY_NAME_ERROR] } : undefined;
        return route.fulfill({ status: refusal, contentType: "application/json", body: JSON.stringify({ success: false, message: "refused", error: { code: "refused", fields } }) });
      },
    );
    await page.goto("/dashboard/manager/services");
    await page.getByRole("button", { name: services.newService }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: services.form.newCategory }).click();
    await dialog.getByLabel(services.form.newCategoryNameEn).fill("Hair");
    await dialog.getByLabel(services.form.newCategoryNameAr).fill("شعر");

    await dialog.getByRole("button", { name: services.form.addCategory }).click();
    await expect(dialog.getByText(CATEGORY_NAME_ERROR)).toBeVisible();

    refusal = HttpStatus.InternalServerError;
    await dialog.getByRole("button", { name: services.form.addCategory }).click();
    await expect(dialog.getByText(services.form.errors.generic)).toBeVisible();
  });

  test("deactivates and reactivates a service from its switch", async ({ page }) => {
    await signIn(page);
    await page.goto("/dashboard/manager/services");

    await page.getByRole("switch", { name: services.toggle.deactivate.replace("{name}", HAIRCUT) }).locator("visible=true").first().click();
    await expect(page.getByText(services.toast.deactivated)).toBeVisible();
    const activate = page.getByRole("switch", { name: services.toggle.activate.replace("{name}", HAIRCUT) }).locator("visible=true").first();
    await expect(activate).not.toBeChecked();

    await activate.click();
    await expect(page.getByText(services.toast.activated)).toBeVisible();
    await expect(page.getByRole("switch", { name: services.toggle.deactivate.replace("{name}", HAIRCUT) }).locator("visible=true").first()).toBeChecked();
  });
});
