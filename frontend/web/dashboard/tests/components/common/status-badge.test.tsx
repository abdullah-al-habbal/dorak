// @vitest-environment jsdom
import "@tests/helpers/dom.helper";

import { render, screen } from "@testing-library/react";
import type { JSX, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { BarberStatusBadge } from "@/components/barber-approvals/barber-status-badge";
import { BookingStatusBadge } from "@/components/bookings/booking-status-badge";
import { BranchStatusBadge } from "@/components/branches/branch-status-badge";
import { ChairStatusBadge } from "@/components/chairs/chair-status-badge";
import { ClientStatusBadge } from "@/components/clients/client-status-badge";
import { StatusBadge } from "@/components/common/status-badge";
import { InvitationStatusBadge } from "@/components/invitations/invitation-status-badge";
import { ApplicationStatusBadge, PostingStatusBadge } from "@/components/jobs/job-status-badges";
import { PayoutStatusBadge } from "@/components/payouts/payout-status-badge";
import { I18nContext } from "@/components/providers/i18n-context";
import { ReviewStatusBadge } from "@/components/reviews/review-status-badge";
import { StylistStatusBadge } from "@/components/stylists/stylist-status-badge";
import { FeedbackStatusBadge } from "@/components/support/feedback-status-badge";
import { SubscriptionStatusBadge } from "@/components/subscription/subscription-status-badge";
import { BrandStatusBadge } from "@/components/admin-brands/brand-status-badge";
import { Locale } from "@/enums/access/locale.enum";
import { TextDirection } from "@/enums/access/text-direction.enum";
import { resetEnumLabelWarnings } from "@/lib/core/format/enum-label.util";
import { arDictionary } from "@/locales/ar/index.constant";
import { enDictionary } from "@/locales/en/index.constant";

const NEW_BACKEND_STATUS = "brand_new_status";

function wrap(children: ReactNode, locale: Locale = Locale.En): JSX.Element {
  const dictionary = locale === Locale.Ar ? arDictionary : enDictionary;
  const direction = locale === Locale.Ar ? TextDirection.Rtl : TextDirection.Ltr;
  return <I18nContext.Provider value={{ locale, direction, dictionary }}>{children}</I18nContext.Provider>;
}

// The status prop is typed per badge; the API can still send a value this build has never seen.
const unmapped = NEW_BACKEND_STATUS as never;

const BADGES: ReadonlyArray<readonly [string, JSX.Element]> = [
  ["subscription", <SubscriptionStatusBadge key="s" status={unmapped} />],
  ["booking", <BookingStatusBadge key="b" status={unmapped} />],
  ["barber", <BarberStatusBadge key="ba" status={unmapped} />],
  ["feedback", <FeedbackStatusBadge key="f" status={unmapped} />],
  ["review", <ReviewStatusBadge key="r" status={unmapped} />],
  ["client", <ClientStatusBadge key="c" status={unmapped} banned={false} />],
  ["stylist", <StylistStatusBadge key="st" status={unmapped} />],
  ["brand", <BrandStatusBadge key="br" status={unmapped} />],
  ["branch", <BranchStatusBadge key="bh" status={unmapped} />],
  ["chair", <ChairStatusBadge key="ch" status={unmapped} />],
  ["payout", <PayoutStatusBadge key="p" status={unmapped} />],
  ["invitation", <InvitationStatusBadge key="i" status={NEW_BACKEND_STATUS} />],
  ["job posting", <PostingStatusBadge key="jp" status={NEW_BACKEND_STATUS} />],
  ["job application", <ApplicationStatusBadge key="ja" status={NEW_BACKEND_STATUS} />],
];

describe("status badges with a status this build does not know", () => {
  beforeEach(() => {
    resetEnumLabelWarnings();
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
  });

  it.each(BADGES)("%s badge shows Unknown instead of throwing or showing the raw key", (_name, badge) => {
    const { container } = render(wrap(badge));
    expect(screen.getByText(enDictionary.common.unknown)).toBeTruthy();
    expect(container.textContent).not.toContain(NEW_BACKEND_STATUS);
  });

  it.each(BADGES)("%s badge shows the Arabic Unknown text", (_name, badge) => {
    render(wrap(badge, Locale.Ar));
    expect(screen.getByText(arDictionary.common.unknown)).toBeTruthy();
  });

  it("does not turn an unknown status into a different known one", () => {
    render(wrap(<InvitationStatusBadge status={NEW_BACKEND_STATUS} />));
    expect(screen.queryByText(enDictionary.invitations.status.pending)).toBeNull();
  });
});

describe("StatusBadge", () => {
  it("renders the mapped label for a known key", () => {
    render(wrap(<BookingStatusBadge status={"confirmed" as never} />));
    expect(screen.getByText(enDictionary.bookings.status.confirmed)).toBeTruthy();
  });

  it("treats a missing status as unknown", () => {
    render(wrap(<StatusBadge status={null} styles={{}} labels={{}} scope="test" />));
    expect(screen.getByText(enDictionary.common.unknown)).toBeTruthy();
  });

  it("warns once per scope and key outside production", () => {
    resetEnumLabelWarnings();
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const { rerender } = render(wrap(<StatusBadge status="x" styles={{}} labels={{}} scope="once" />));
    rerender(wrap(<StatusBadge status="x" styles={{}} labels={{}} scope="once" />));
    expect(warn).toHaveBeenCalledTimes(1);
  });
});
