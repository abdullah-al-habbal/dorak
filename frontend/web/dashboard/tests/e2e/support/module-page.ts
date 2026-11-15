import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";

import { dictionaryFor, expectNoHorizontalScroll, signIn } from "@tests/e2e/support/sign-in";
import type { E2ELocale } from "@tests/e2e/support/sign-in";
import type { Dictionary } from "@/types/core/dictionary.type";

type Guard = "manager" | "owner" | "barber" | "admin";

export interface ModulePage {
  guard: Guard;
  /** Portal path below `/dashboard/<guard>/`. */
  segment: string;
  /** Picks the module's `<h1>` text from the dictionary of the locale under test. */
  title: (dictionary: Dictionary) => string;
}

/** Signs in, opens the module and checks its heading, text direction and that nothing scrolls sideways. */
export async function openModule(page: Page, module: ModulePage, locale: E2ELocale = "en"): Promise<Dictionary> {
  const dictionary = dictionaryFor(locale);
  await signIn(page, locale, module.guard);
  await page.goto(`/dashboard/${module.guard}/${module.segment}`);
  await expect(page.getByRole("heading", { level: 1, name: module.title(dictionary) })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("dir", locale === "ar" ? "rtl" : "ltr");
  await expectNoHorizontalScroll(page);
  return dictionary;
}

/** The module follows the dark colour scheme and still fits the viewport. */
export async function expectDarkScheme(page: Page, module: ModulePage): Promise<void> {
  await page.emulateMedia({ colorScheme: "dark" });
  await openModule(page, module);
  await expect(page.locator("html")).toHaveClass(/dark/);
}

/**
 * A directory shows a table on wide screens and a card list on phones. Checks that the email is listed in whichever
 * layout is visible, and the column header only when the table is.
 */
export async function expectDirectoryRow(page: Page, row: { email: string; emailColumn: string }): Promise<void> {
  const table = page.getByRole("table");
  if (await table.isVisible()) await expect(page.getByRole("columnheader", { name: row.emailColumn })).toBeVisible();
  await expect(page.getByText(row.email).locator("visible=true")).toBeVisible();
}
