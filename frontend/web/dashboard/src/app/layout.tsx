import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, IBM_Plex_Sans_Arabic, Instrument_Sans } from "next/font/google";
import { Suspense } from "react";

import { RouteProgress } from "@/components/feedback/route-progress";
import { AppProviders } from "@/components/providers/app-providers";
import { LocaleBoundary } from "@/components/providers/locale-boundary";
import { LOCALE_DIRECTION } from "@/config/locales.constant";
import { PRE_PAINT_SCRIPT } from "@/config/theme.constant";
import { getServerLocale } from "@/locales/get-server-locale";

import "@/app/globals.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display-latin", display: "swap" });
const body = Instrument_Sans({ subsets: ["latin"], variable: "--font-body-latin", display: "swap" });
const arabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Dorak", template: "%s · Dorak" },
  description: "Operations workspace for salons and barbershops.",
};

/**
 * `lang` and `dir` come from the locale cookie on the server, so the document is rendered per request
 * instead of from a static shell. Everything below it still streams behind its own Suspense boundaries.
 */
export const instant = false;

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f6fa" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1220" },
  ],
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getServerLocale();
  return (
    <html
      lang={locale}
      dir={LOCALE_DIRECTION[locale]}
      suppressHydrationWarning
      className={`${display.variable} ${body.variable} ${arabic.variable} h-full`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: PRE_PAINT_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col">
        <Suspense fallback={<RouteProgress />}>
          <LocaleBoundary>
            <AppProviders>{children}</AppProviders>
          </LocaleBoundary>
        </Suspense>
      </body>
    </html>
  );
}
