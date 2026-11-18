// @vitest-environment jsdom
import "@tests/helpers/dom.helper";

import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ReviewResolveDialog } from "@/components/review-moderation/review-resolve-dialog";
import { ReviewStatus } from "@/enums/people/review-status.enum";
import { enDictionary } from "@/locales/en/index.constant";
import { renderInApp } from "@tests/helpers/list-screen.helper";
import type { AdminReview } from "@/types/clients/reviews/admin-review.type";

const mutateAsync = vi.hoisted(() => vi.fn());
vi.mock("@/hooks/clients/reviews/use-resolve-review", () => ({ useResolveReview: () => ({ mutateAsync, isPending: false }) }));

const t = enDictionary.reviewModeration;
const disputed = { id: "rv1", status: ReviewStatus.Disputed, rating: 1, author_name: "Sam", body: "Rude", dispute_reason: "Never visited", subject_name: "Omar" } as unknown as AdminReview;

describe("ReviewResolveDialog", () => {
  beforeEach(() => {
    mutateAsync.mockReset();
    mutateAsync.mockResolvedValue(undefined);
  });

  it("shows the review beside the dispute reason", () => {
    renderInApp(<ReviewResolveDialog review={disputed} onClose={vi.fn()} />);
    expect(screen.getByText("Rude")).toBeInTheDocument();
    expect(screen.getByText("Never visited")).toBeInTheDocument();
  });

  it("publishes again by default and leaves a blank note out", async () => {
    const onClose = vi.fn();
    renderInApp(<ReviewResolveDialog review={disputed} onClose={onClose} />);
    await userEvent.click(screen.getByRole("button", { name: t.dialog.confirmPublish }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(mutateAsync).toHaveBeenCalledWith({ id: "rv1", status: ReviewStatus.Published, note: undefined });
  });

  it("hides the review with a trimmed note after choosing that outcome", async () => {
    renderInApp(<ReviewResolveDialog review={disputed} onClose={vi.fn()} />);
    await userEvent.selectOptions(screen.getByLabelText(new RegExp(`^${t.dialog.outcome}`)), ReviewStatus.Hidden);
    await userEvent.type(screen.getByLabelText(new RegExp(`^${t.dialog.note}`)), "  Abusive  ");
    await userEvent.click(screen.getByRole("button", { name: t.dialog.confirmHide }));
    await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith({ id: "rv1", status: ReviewStatus.Hidden, note: "Abusive" }));
  });

  it("shows the failure inline and stays open", async () => {
    mutateAsync.mockImplementation(async () => {
      throw new Error("boom");
    });
    const onClose = vi.fn();
    renderInApp(<ReviewResolveDialog review={disputed} onClose={onClose} />);
    await userEvent.click(screen.getByRole("button", { name: t.dialog.confirmPublish }));
    expect(await screen.findByText(t.dialog.failed)).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("is read-only for a review that is no longer disputed", () => {
    renderInApp(<ReviewResolveDialog review={{ ...disputed, status: ReviewStatus.Hidden, resolution_note: "Done" } as unknown as AdminReview} onClose={vi.fn()} />);
    expect(screen.getByText("Done")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: t.dialog.confirmPublish })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: t.dialog.back })).toBeInTheDocument();
  });
});
