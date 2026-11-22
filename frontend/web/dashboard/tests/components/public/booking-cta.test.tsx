// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import "@tests/helpers/dom.helper";
import { BookingCta } from "@/components/public/booking-cta";
import { DICTIONARIES } from "@/locales/dictionaries.constant";
import { Locale } from "@/enums/access/locale.enum";

describe("BookingCta", () => {
  it("links to the app when a URL is configured", () => {
    render(<BookingCta appUrl="https://app.example/dorak" dictionary={DICTIONARIES[Locale.En].publicProfile} />);
    expect(screen.getByRole("link", { name: "Open the Dorak app" })).toHaveAttribute("href", "https://app.example/dorak");
  });

  it("only says where to book without a URL, in Arabic too", () => {
    render(<BookingCta appUrl={null} dictionary={DICTIONARIES[Locale.Ar].publicProfile} />);
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByText("الحجز متاح عبر تطبيق دورك.")).toBeInTheDocument();
  });
});
