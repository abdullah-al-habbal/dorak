export interface IUpdateSettingsInput {
  preferredLanguage?: "en" | "ar" | null;
  notificationEnabled?: boolean;
  displayCurrencyId?: string | null;
  theme?: "light" | "dark" | null;
  priceDisplayMode?: "tax_inclusive" | "tax_exclusive" | null;
}
