import { expect, test } from "@playwright/test";

import { BookingStatus } from "@/enums/booking-status.enum";
import { BookingView } from "@/enums/booking-view.enum";
import { HttpMethod } from "@/enums/http-method.enum";
import { HttpStatus } from "@/enums/http-status.enum";
import { holdRequests } from "@tests/e2e/support/hold-requests";
import { dictionaryFor, expectNoHorizontalScroll, signIn } from "@tests/e2e/support/sign-in";

const { bookings, common } = dictionaryFor("en");
const BOOKINGS_API = "/api/dashboard/bookings";
const HISTORY_API = /^\/api\/dashboard\/bookings\/[^/]+\/history$/;
const BOOKING_API = /^\/api\/dashboard\/bookings\/[^/]+$/;

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

  test("toasts the status-specific reason when a status change is refused", async ({ page }) => {
    await signIn(page);
    let refusal: number = HttpStatus.Conflict;
    await page.route(
      (url) => BOOKING_API.test(url.pathname),
      async (route) => {
        if (route.request().method() !== HttpMethod.Patch) return route.fallback();
        return route.fulfill({ status: refusal, contentType: "application/json", body: "{}" });
      },
    );
    await page.goto("/dashboard/manager/bookings?view=list");
    await page.getByRole("button", { name: /^Nadia Farah, / }).locator("visible=true").first().click();
    const dialog = page.getByRole("dialog");
    const confirm = dialog.getByRole("button", { name: bookings.action.confirmed });

    await confirm.click();
    await expect(page.getByText(bookings.toast.conflict)).toBeVisible();

    refusal = HttpStatus.BadRequest;
    await confirm.click();
    await expect(page.getByText(bookings.toast.invalid)).toBeVisible();
    await expect(dialog).toBeVisible();
  });

  test("keeps the view and filters in the URL and resets the page when a filter changes", async ({ page }) => {
    await signIn(page);
    await page.goto("/dashboard/manager/bookings?view=list&page=2");
    await expect(page.getByRole("heading", { level: 1, name: bookings.title })).toBeVisible();

    await page.getByLabel(bookings.filters.status).selectOption(BookingStatus.Confirmed);
    await expect(page).toHaveURL(/[?&]status=confirmed/);
    const afterFilter = new URL(page.url()).searchParams;
    expect(afterFilter.get("view")).toBe(BookingView.List);
    expect(afterFilter.has("page")).toBe(false);

    await page.getByRole("group", { name: bookings.views.label }).getByRole("button", { name: bookings.views.week }).click();
    await expect(page).not.toHaveURL(/[?&]view=/);
    expect(new URL(page.url()).searchParams.get("status")).toBe(BookingStatus.Confirmed);
  });
});
