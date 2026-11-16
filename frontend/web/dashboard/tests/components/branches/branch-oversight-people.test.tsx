// @vitest-environment jsdom
import "@tests/helpers/dom.helper";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { BranchOversightPeople } from "@/components/branches/oversight/branch-oversight-people";
import { I18nContext } from "@/components/providers/i18n-context";
import { INVITATION_FILTER_ALL } from "@/config/ops/invitation.constant";
import { Locale } from "@/enums/access/locale.enum";
import { TextDirection } from "@/enums/access/text-direction.enum";
import { enDictionary } from "@/locales/en/index.constant";

const invitations = vi.hoisted(() => vi.fn());
const jobs = vi.hoisted(() => vi.fn());

vi.mock("@/hooks/branches/invitations/use-invitations", () => ({ useInvitations: invitations }));
vi.mock("@/hooks/jobs/use-job-postings", () => ({ useJobPostings: jobs }));

const BRANCH = "branch-1";

function pageOf(items: unknown[], current: number, total: number): { data: unknown } {
  return { data: { items, page: { current_page: current, total_pages: total, per_page: 15, total: items.length } } };
}

function wrap(children: ReactNode): ReactNode {
  return <I18nContext.Provider value={{ locale: Locale.En, direction: TextDirection.Ltr, dictionary: enDictionary }}>{children}</I18nContext.Provider>;
}

describe("BranchOversightPeople", () => {
  beforeEach(() => {
    invitations.mockReset();
    jobs.mockReset();
    invitations.mockReturnValue(pageOf([{ id: "i1", barber_name: { en: "Sam" }, status: "pending" }], 1, 3));
    jobs.mockReturnValue(pageOf([{ id: "j1", title: { en: "Barber" }, status: "open" }], 1, 1));
  });

  it("starts both sections on page 1 and lists every status", () => {
    render(wrap(<BranchOversightPeople branchId={BRANCH} />));
    expect(invitations).toHaveBeenCalledWith(BRANCH, INVITATION_FILTER_ALL, 1);
    expect(jobs).toHaveBeenCalledWith(BRANCH, 1);
    expect(screen.getByText("Sam")).toBeInTheDocument();
  });

  it("pages the invitations without touching the job postings", async () => {
    render(wrap(<BranchOversightPeople branchId={BRANCH} />));
    await userEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(invitations).toHaveBeenLastCalledWith(BRANCH, INVITATION_FILTER_ALL, 2);
    expect(jobs).toHaveBeenLastCalledWith(BRANCH, 1);
  });

  it("shows the empty copy and no pagination for an empty page", () => {
    invitations.mockReturnValue(pageOf([], 1, 1));
    render(wrap(<BranchOversightPeople branchId={BRANCH} />));
    expect(screen.getByText("No invitations.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /next/i })).not.toBeInTheDocument();
  });
});
