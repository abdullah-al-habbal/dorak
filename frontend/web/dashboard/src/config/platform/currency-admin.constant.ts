export const CURRENCY_CODE_LENGTH = 3;
export const CURRENCY_NAME_MAX = 80;
export const CURRENCY_SYMBOL_MAX = 10;
/** A rate is typed as text and checked by the backend; this only blocks the obvious. */
export const RATE_PATTERN = /^\d+(\.\d{1,6})?$/;
export type CurrencyView = "currencies" | "rates";
