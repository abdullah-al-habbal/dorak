import Providers from "@/app/providers";
import { getServerI18n } from "@/i18n/server";
import { cn } from "@/utils/cn.util";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "@/app/css/default.css";
import "@/app/css/dark.css";
import "@/app/globals.css";

const notoArabic = localFont({
  variable: "--font-arabic",
  src: [
    { path: "./fonts/noto-sans-arabic-regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/noto-sans-arabic-bold.ttf", weight: "700", style: "normal" },
  ],
});

export async function generateMetadata(): Promise<Metadata> {
  const { dictionary } = await getServerI18n();

  return {
    title: {
      template: `%s | ${dictionary.meta.appName}`,
      default: dictionary.meta.appName,
    },
    description: dictionary.meta.appDescription,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { locale, dir, dictionary } = await getServerI18n();

  return (
    <html
      suppressHydrationWarning
      dir={dir}
      lang={locale}
      className={cn(
        "h-full overflow-hidden antialiased",
        notoArabic.variable,
      )}
    >
      <body className="h-full overflow-hidden bg-background-gray-secondary_alt_2">
        <Providers locale={locale} dir={dir} dictionary={dictionary}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
