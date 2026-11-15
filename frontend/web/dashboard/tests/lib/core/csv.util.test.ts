import { describe, expect, it } from "vitest";

import { csvCell, toCsv } from "@/lib/csv.util";
import { earningsCsv, earningsFilename } from "@/lib/earnings-csv.util";

describe("csvCell", () => {
  it("quotes values and doubles embedded quotes", () => {
    expect(csvCell('say "hi", ok')).toBe('"say ""hi"", ok"');
    expect(csvCell(12)).toBe('"12"');
  });

  it.each(["=SUM(A1)", "+1", "-1", "@cmd", "\tx", "\rx"])("neutralises the formula prefix in %j", (value) => {
    expect(csvCell(value)).toBe(`"'${value}"`);
  });

  it("leaves Arabic text intact", () => {
    expect(csvCell("الأرباح")).toBe('"الأرباح"');
  });
});

describe("toCsv", () => {
  it("starts with a BOM and separates rows with CRLF", () => {
    const csv = toCsv([["a", "b"], ["1", "2"]]);
    expect(csv.startsWith("﻿")).toBe(true);
    expect(csv.slice(1)).toBe('"a","b"\r\n"1","2"');
  });
});

describe("earnings export", () => {
  it("writes revenue in major units and names the file after the range", () => {
    const csv = earningsCsv(
      { scope: "branch", totals: [], previous_totals: null, series: [{ date: "2026-03-01", currency_code: "USD", gross_minor: 1250, completed_bookings_count: 2 }] },
      { date: "Date", currency: "Currency", bookings: "Bookings", revenue: "Revenue" },
    );
    expect(csv).toContain('"2026-03-01","USD","2","12.50"');
    expect(earningsFilename({ from: "2026-03-01", to: "2026-03-31" })).toBe("earnings_2026-03-01_2026-03-31.csv");
  });
});
