import { expect, test } from "@playwright/test";
import type { BrowserContext } from "@playwright/test";

import { ACCESS_COOKIE, CLAIM_COOKIE, REFRESH_COOKIE } from "@/config/cookies.constant";
import { E2E_APP_URL } from "@tests/e2e/support/e2e-env.constant";
import { dictionaryFor, signInThroughForm } from "@tests/e2e/support/sign-in";

const { bookings } = dictionaryFor("en");
/** What a pre-`tid` session cookie looks like to the BFF: it fails local verification, so the refresh cookie must renew it. */
const UNUSABLE_CLAIM = "legacy.claim.without-tid";

async function cookieValue(context: BrowserContext, name: string): Promise<string | undefined> {
  return (await context.cookies(E2E_APP_URL)).find((cookie) => cookie.name === name)?.value;
}

async function breakClaimCookie(context: BrowserContext): Promise<void> {
  const claim = (await context.cookies(E2E_APP_URL)).find((cookie) => cookie.name === CLAIM_COOKIE);
  expect(claim).toBeDefined();
  await context.addCookies([{ ...claim!, value: UNUSABLE_CLAIM }]);
}

// Each test signs in on its own: a refresh rotates the refresh token and expires the previous access token (D-05),
// so the saved sessions shared with other specs must never be used here.
test.describe("session refresh with the tid-bound claim (F-05)", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("renews a legacy or unusable claim cookie from the refresh cookie without signing the user out", async ({ page }) => {
    await signInThroughForm(page);
    const refreshBefore = await cookieValue(page.context(), REFRESH_COOKIE);
    await breakClaimCookie(page.context());

    await page.goto("/dashboard/manager/bookings");

    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.getByRole("heading", { level: 1, name: bookings.title })).toBeVisible();
    const claimAfter = await cookieValue(page.context(), CLAIM_COOKIE);
    expect(claimAfter).toBeTruthy();
    expect(claimAfter).not.toBe(UNUSABLE_CLAIM);
    expect(await cookieValue(page.context(), REFRESH_COOKIE)).not.toBe(refreshBefore);
    expect(await cookieValue(page.context(), ACCESS_COOKIE)).toBeTruthy();
  });

  test("keeps the session when two navigations refresh with the same refresh cookie at once", async ({ page, context }) => {
    await signInThroughForm(page);
    await breakClaimCookie(context);
    const second = await context.newPage();

    await Promise.all([page.goto("/dashboard/manager/bookings"), second.goto("/dashboard/manager/earnings")]);

    for (const tab of [page, second]) {
      await expect(tab).not.toHaveURL(/\/login/);
    }
    expect(await cookieValue(context, CLAIM_COOKIE)).not.toBe(UNUSABLE_CLAIM);
    expect(await cookieValue(context, REFRESH_COOKIE)).toBeTruthy();

    // The surviving session still works for a later request, so no deletion Set-Cookie from a losing refresh won.
    await page.goto("/dashboard/manager/bookings");
    await expect(page.getByRole("heading", { level: 1, name: bookings.title })).toBeVisible();
  });
});
