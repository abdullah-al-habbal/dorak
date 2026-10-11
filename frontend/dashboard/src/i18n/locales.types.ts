import type { Dictionary } from "@/i18n/dictionary.types";
import type { LOCALES } from "@/i18n/locales.constant";

export type Locale = (typeof LOCALES)[number];

export type Direction = "ltr" | "rtl";

export type LocaleSwitchCopyKey = keyof Dictionary["common"]["locale"];
