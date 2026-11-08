import type { Page } from "@playwright/test";

/** Holds every request whose path matches until the returned release function is called, so a spec can see loading states. */
export async function holdRequests(page: Page, matches: (pathname: string) => boolean): Promise<() => void> {
  let release: () => void = () => undefined;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route((url) => matches(url.pathname), async (route) => {
    await gate;
    await route.continue();
  });
  return release;
}
