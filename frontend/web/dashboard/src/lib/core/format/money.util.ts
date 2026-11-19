/** The backend stores every price in minor units with two decimals (see formatPrice). */
export const MINOR_UNIT_FACTOR = 100;
export const DECIMALS = 2;
const ARABIC_INDIC_ZERO = 0x0660;
const EASTERN_ARABIC_INDIC_ZERO = 0x06f0;
const DECIMAL_PATTERN = /^\d+(\.\d{1,2})?$/;

/** Rewrites Arabic-Indic and Persian digits and the Arabic decimal separator to ASCII. */
function normalizeDigits(text: string): string {
  return text
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - ARABIC_INDIC_ZERO))
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - EASTERN_ARABIC_INDIC_ZERO))
    .replace(/[٫٬,]/g, (mark) => (mark === "٫" || mark === "," ? "." : ""));
}

/** "12.5" becomes 1250. Returns null for empty, negative, non-numeric or sub-cent input. */
export function parseMinorUnits(text: string): number | null {
  const normalized = normalizeDigits(text.trim());
  if (!DECIMAL_PATTERN.test(normalized)) return null;
  const [whole, fraction = ""] = normalized.split(".");
  return Number(whole) * MINOR_UNIT_FACTOR + Number(fraction.padEnd(DECIMALS, "0"));
}

/** 1250 becomes "12.50", the editable form of a price. */
export function minorUnitsToInput(minor: number): string {
  return (minor / MINOR_UNIT_FACTOR).toFixed(DECIMALS);
}
