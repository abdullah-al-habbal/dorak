import { expect, test } from "@playwright/test";

import { dictionaryFor, expectNoHorizontalScroll, resetBackend, signIn } from "@tests/e2e/support/sign-in";

const { invitations } = dictionaryFor("en");

const UNKNOWN_CONTACT = "nobody.here@example.test";

test.describe("barber invitations", () => {
  test.afterEach(async () => {
    await resetBackend();
  });

  test("invites by an exact contact and answers the same whether or not anyone matched", async ({ page }) => {
    await signIn(page);
    await page.goto("/dashboard/manager/stylists");
    await page.getByRole("button", { name: invitations.tab }).click();
    await page.getByRole("button", { name: invitations.invite }).first().click();

    const dialog = page.getByRole("dialog");
    await dialog.getByRole("searchbox").fill(UNKNOWN_CONTACT);
    await dialog.getByRole("searchbox").press("Enter");
    await expect(dialog.getByText(invitations.inviteDialog.contactHint)).toBeVisible();
    await expectNoHorizontalScroll(page);

    await dialog.getByRole("button", { name: invitations.inviteDialog.submit }).click();
    await expect(page.getByText(invitations.toast.requested)).toBeVisible();
    await expect(page.getByRole("dialog")).toBeHidden();
  });
});
