// @vitest-environment jsdom
import "@tests/helpers/dom.helper";

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AnalyticsMoney } from "@/components/analytics/analytics-money";
import { I18nProvider } from "@/components/providers/i18n-provider";
import { LOCALE_DIRECTION } from "@/config/locales.constant";
import { Locale } from "@/enums/access/locale.enum";
import { DICTIONARIES } from "@/locales/dictionaries.constant";

const analytics = {
  subscriptions: { recurring_revenue: [{ currency: "USD", total_amount_minor: 100 }] },
  commission: { pending: [], settled: [] },
  payouts: [{ status: "brand_new_status", currency: "USD", payouts: 2, total_amount_minor: 500 }],
} as never;

describe("AnalyticsMoney", () => {
  it("shows Unknown for a payout status the dictionary lacks, never the raw status", () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(
      <I18nProvider value={{ locale: Locale.Ar, direction: LOCALE_DIRECTION[Locale.Ar], dictionary: DICTIONARIES[Locale.Ar] }}>
        <AnalyticsMoney analytics={analytics} locale={Locale.Ar} />
      </I18nProvider>,
    );
    expect(screen.getByText(new RegExp(DICTIONARIES[Locale.Ar].common.unknown))).toBeInTheDocument();
    expect(screen.queryByText(/brand_new_status/)).not.toBeInTheDocument();
  });
});
