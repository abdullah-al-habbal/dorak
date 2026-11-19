import { describe, expect, it } from "vitest";

import { formatPrice } from "@/lib/core/format/booking-format.util";

// Intl separates a currency code from the number with a no-break space.
const plain = (text: string) => text.replace(/\u00a0/g, " ");

describe("formatPrice", () => {
  it("shows the two stored decimals for a currency whose ISO exponent is 0", () => {
    expect(plain(formatPrice(1250, "SYP", "en"))).toBe("SYP 12.50");
    expect(plain(formatPrice(1255, "SYP", "en"))).toBe("SYP 12.55");
  });

  it("shows two decimals for a currency whose ISO exponent is 3", () => {
    expect(plain(formatPrice(1250, "KWD", "en"))).toBe("KWD 12.50");
  });

  it("keeps the usual two-decimal currencies unchanged", () => {
    expect(formatPrice(1250, "USD", "en")).toBe("$12.50");
  });

  it("formats a price without a currency with two decimals", () => {
    expect(formatPrice(1250, null, "en")).toBe("12.50");
    expect(formatPrice(0, undefined, "en")).toBe("0.00");
  });
});
