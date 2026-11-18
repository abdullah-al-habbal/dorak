import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import type { ReactElement } from "react";

import { I18nContext } from "@/components/providers/i18n-context";
import { Locale } from "@/enums/access/locale.enum";
import { TextDirection } from "@/enums/access/text-direction.enum";
import { enDictionary } from "@/locales/en/index.constant";

/** What a screen test mocks its data hook and the URL with; build it with `vi.hoisted` so `vi.mock` factories can read it. */
export interface ListHarness {
  query: Record<string, unknown>;
  search: string;
  refetch: Mock;
}

/** The dictionary strings every list screen shows for its states. */
export interface ListStates {
  errorTitle: string;
  errorBody: string;
  emptyTitle: string;
  emptyBody: string;
  filteredTitle: string;
  filteredBody: string;
  results: string;
  forbiddenTitle?: string;
}

interface ListStateCase {
  /** Renders the screen with the actor that may see it. */
  screen: () => ReactElement;
  harness: ListHarness;
  states: ListStates;
  /** A query string that makes the screen's filters count as applied. Defaults to a text search. */
  filteredSearch?: string;
  /** Renders the screen with an actor that may not see it, for screens that gate by role. */
  forbidden?: () => ReactElement;
}

export const DEFAULT_FILTERED_SEARCH = "search=zzz";

export function pageOf(items: unknown[]): { items: unknown[]; page: { current_page: number; total_pages: number; total: number } } {
  return { items, page: { current_page: 1, total_pages: 1, total: items.length } };
}

export function renderInApp(ui: ReactElement): void {
  render(<I18nContext.Provider value={{ locale: Locale.En, direction: TextDirection.Ltr, dictionary: enDictionary }}>{ui}</I18nContext.Provider>);
}

function setQuery(harness: ListHarness, fields: Record<string, unknown>): void {
  harness.query = { isPending: false, isError: false, isFetching: false, data: undefined, refetch: harness.refetch, ...fields };
}

/** The five states every list screen ships: loading, error with retry, empty, filtered-empty and rows (plus forbidden where the screen gates by role). */
export function describeListStates({ screen: renderScreen, harness, states, filteredSearch = DEFAULT_FILTERED_SEARCH, forbidden }: ListStateCase): void {
  const retry = enDictionary.common.retry;
  const loading = { name: enDictionary.common.loading };

  describe("states", () => {
    const show = (fields: Record<string, unknown>, search = ""): void => {
      harness.search = search;
      setQuery(harness, fields);
      renderInApp(renderScreen());
    };

    it("shows a loading skeleton and nothing else while the first page loads", () => {
      show({ isPending: true, isFetching: true });
      expect(screen.getByRole("status", loading)).toBeInTheDocument();
      expect(screen.queryByText(states.emptyTitle)).not.toBeInTheDocument();
      expect(screen.queryByText(states.errorTitle)).not.toBeInTheDocument();
    });

    it("shows the error state with a working retry when the first load fails", async () => {
      harness.refetch.mockClear();
      show({ isError: true });
      expect(screen.getByRole("alert")).toHaveTextContent(states.errorTitle);
      expect(screen.getByText(states.errorBody)).toBeInTheDocument();
      await userEvent.click(screen.getByRole("button", { name: retry }));
      expect(harness.refetch).toHaveBeenCalledTimes(1);
    });

    it("shows the empty state when there are no records and no filters", () => {
      show({ data: pageOf([]) });
      expect(screen.getByText(states.emptyTitle)).toBeInTheDocument();
      expect(screen.getByText(states.emptyBody)).toBeInTheDocument();
      expect(screen.queryByText(states.filteredTitle)).not.toBeInTheDocument();
    });

    it("shows the filtered-empty state, not the empty one, when filters hide everything", () => {
      show({ data: pageOf([]) }, filteredSearch);
      expect(screen.getByText(states.filteredTitle)).toBeInTheDocument();
      expect(screen.getByText(states.filteredBody)).toBeInTheDocument();
      expect(screen.queryByText(states.emptyTitle)).not.toBeInTheDocument();
    });

    it("shows the rows and the result count, with no empty or error state", () => {
      show({ data: pageOf([{ id: "1" }, { id: "2" }]) });
      expect(screen.getAllByTestId("rows").length).toBeGreaterThan(0);
      expect(screen.getByText(states.results.replace("{count}", "2"))).toBeInTheDocument();
      expect(screen.queryByText(states.emptyTitle)).not.toBeInTheDocument();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("keeps the rows on screen when a refresh fails", () => {
      show({ isError: true, data: pageOf([{ id: "1" }]) });
      expect(screen.getAllByTestId("rows").length).toBeGreaterThan(0);
      expect(screen.queryByText(states.errorTitle)).not.toBeInTheDocument();
    });

    if (forbidden && states.forbiddenTitle) {
      it("shows the forbidden state, without loading anything, for a role that may not see it", () => {
        harness.search = "";
        setQuery(harness, { isPending: true });
        renderInApp(forbidden());
        expect(screen.getByText(states.forbiddenTitle ?? "")).toBeInTheDocument();
        expect(screen.queryByRole("status", loading)).not.toBeInTheDocument();
      });
    }
  });
}

/** `vi.fn` kept here so test files need one import for the harness. */
export function createHarness(): ListHarness {
  return { query: {}, search: "", refetch: vi.fn() };
}
