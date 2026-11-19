import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import type { ReactElement } from "react";

import { OverlayContext } from "@/components/overlays/overlay-context";
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

/** What a render hands back: the overlay `open` spy and the query client, so a test can refresh the data. */
export interface AppRender {
  overlayOpen: Mock;
  queryClient: QueryClient;
}

/** Renders inside the real i18n and query providers; the overlay context records `open` instead of mounting dialogs. */
export function renderInApp(ui: ReactElement): AppRender {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const overlayOpen = vi.fn();
  render(
    <QueryClientProvider client={queryClient}>
      <I18nContext.Provider value={{ locale: Locale.En, direction: TextDirection.Ltr, dictionary: enDictionary }}>
        <OverlayContext.Provider value={{ request: null, open: overlayOpen, close: vi.fn() }}>{ui}</OverlayContext.Provider>
      </I18nContext.Provider>
    </QueryClientProvider>,
  );
  return { overlayOpen, queryClient };
}

/** The mocked `next/navigation` state: the query string the screen reads, and the `router.replace` calls it makes. */
export interface Navigation {
  search: string;
  replace: Mock;
}

export function createNavigation(): Navigation {
  return { search: "", replace: vi.fn() };
}

function jsonReply(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

type Reply = () => Promise<Response>;

/** A `fetch` answer carrying the backend's success envelope; a fresh `Response` per call. */
export function dataReply(data: unknown, meta?: unknown): Reply {
  return async () => jsonReply(200, { success: true, message: "OK", data, meta });
}

/** A `fetch` answer carrying the backend's success envelope for a list. */
export function listReply(records: unknown[], pagination?: { total: number; per_page: number; current_page: number; total_pages: number }): Reply {
  return dataReply(records, pagination ? { pagination } : undefined);
}

/** A `fetch` answer carrying the backend's failure envelope. */
export function failureReply(status = 500): Reply {
  return async () => jsonReply(status, { success: false, message: "Server error", error: { code: "server_error" } });
}

/** A request that never completes, for the loading state. */
export const pendingReply: Reply = () => new Promise<Response>(() => undefined);

/** The fake network of one list screen test. */
export interface FetchServer {
  /** Scripts the list endpoint: each request gets the next reply, and the last reply repeats. */
  serve: (...replies: Reply[]) => void;
  /** The URLs the screen requested from the list endpoint, in order. */
  listUrls: () => string[];
}

interface FetchBoundaryOptions {
  /** A fragment of the list endpoint's path, such as `/admin/clients`. */
  listPath: string;
  /** Answers for other requests the screen makes on mount (for example the account profile), keyed by a path fragment. */
  side?: Record<string, Reply>;
}

/**
 * Installs a fake `fetch` for each test: the one boundary a list screen test may fake.
 * Everything above it (the API client, envelope and Zod parsing, query hooks, filters, toolbar, table) runs for real.
 * A request that is neither the list endpoint nor a declared side request fails the test.
 */
export function installFetchBoundary(nav: Navigation, { listPath, side = {} }: FetchBoundaryOptions): FetchServer {
  const api = vi.fn();
  const unexpected: string[] = [];
  const listUrls: string[] = [];
  let script: Reply[] = [];

  beforeEach(() => {
    api.mockReset();
    unexpected.length = 0;
    listUrls.length = 0;
    script = [];
    nav.replace.mockReset();
    nav.search = "";
    api.mockImplementation((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes(listPath)) {
        const reply = script[Math.min(listUrls.length, script.length - 1)];
        listUrls.push(url);
        if (!reply) throw new Error(`No reply scripted for ${url}`);
        return reply();
      }
      const key = Object.keys(side).find((fragment) => url.includes(fragment));
      if (key) return side[key]!();
      unexpected.push(url);
      return failureReply(404)();
    });
    vi.stubGlobal("fetch", api);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    expect(unexpected).toEqual([]);
  });

  return {
    serve: (...replies) => {
      script = replies;
    },
    listUrls: () => [...listUrls],
  };
}

function setQuery(harness: ListHarness, fields: Record<string, unknown>): void {
  harness.query = { isPending: false, isError: false, isFetching: false, data: undefined, refetch: harness.refetch, ...fields };
}

/**
 * @deprecated Stubs the screen's list and toolbar and replaces its data hook, so it proves the screen's branching only.
 * Use `describeListScreen`, which runs the real children and mocks the network only.
 */
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

interface ListScreenCase {
  /** Renders the screen with the actor that may see it. */
  screen: () => ReactElement;
  /** Renders the screen for an actor that may not see it. */
  forbidden?: { screen: () => ReactElement; title: string };
  server: FetchServer;
  nav: Navigation;
  states: ListStates;
  /** Raw API records and the text the user must then read in the table. */
  rows: { records: unknown[]; visibleText: string[] };
  /** A URL filter that hides everything, the label of the button that clears it, and the query text it must reach the API as. */
  filtered: { search: string; clearLabel: string; sentToApi: string };
}

/**
 * The states every list screen ships, run against the real screen, toolbar, table, query hooks and Zod parsing.
 * Loading and failure are simulated at the network, so the retry button is proven to fetch again and show the data.
 */
export function describeListScreen({ screen: renderScreen, forbidden, server, nav, states, rows, filtered }: ListScreenCase): void {
  const retry = enDictionary.common.retry;
  const loading = { name: enDictionary.common.loading };

  describe("states", () => {
    const show = (search = ""): AppRender => {
      nav.search = search;
      return renderInApp(renderScreen());
    };
    const table = (): HTMLElement => screen.getByRole("table");
    const expectRowsShown = (): void => {
      for (const text of rows.visibleText) expect(within(table()).getByText(text)).toBeInTheDocument();
    };

    it("shows a skeleton and no data, empty or error content while the first request is in flight", () => {
      server.serve(pendingReply);
      show();
      expect(screen.getByRole("status", loading)).toBeInTheDocument();
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(screen.queryByText(states.emptyTitle)).not.toBeInTheDocument();
      expect(server.listUrls()).toHaveLength(1);
    });

    it("shows the error state when the request fails, and the retry button fetches again and shows the data", async () => {
      server.serve(failureReply(), listReply(rows.records));
      show();
      expect(await screen.findByRole("alert")).toHaveTextContent(states.errorTitle);
      expect(screen.getByText(states.errorBody)).toBeInTheDocument();
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
      await userEvent.click(screen.getByRole("button", { name: retry }));
      expect(await screen.findByRole("table")).toBeInTheDocument();
      expect(server.listUrls()).toHaveLength(2);
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expectRowsShown();
    });

    it("shows the empty state, with no clear-filters button, when there are no records and no filters", async () => {
      server.serve(listReply([]));
      show();
      expect(await screen.findByText(states.emptyTitle)).toBeInTheDocument();
      expect(screen.getByText(states.emptyBody)).toBeInTheDocument();
      expect(screen.queryByText(states.filteredTitle)).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: filtered.clearLabel })).not.toBeInTheDocument();
      expect(server.listUrls().at(-1)).not.toContain(filtered.sentToApi);
    });

    it("sends the URL filter to the API and shows the filtered-empty state, whose clear button removes the filter from the URL", async () => {
      server.serve(listReply([]));
      show(filtered.search);
      expect(await screen.findByText(states.filteredTitle)).toBeInTheDocument();
      expect(screen.getByText(states.filteredBody)).toBeInTheDocument();
      expect(screen.queryByText(states.emptyTitle)).not.toBeInTheDocument();
      expect(server.listUrls().at(-1)).toContain(filtered.sentToApi);
      await userEvent.click(screen.getByRole("button", { name: filtered.clearLabel }));
      expect(nav.replace).toHaveBeenCalledTimes(1);
      expect(String(nav.replace.mock.calls[0]?.[0])).not.toContain(filtered.sentToApi);
    });

    it("renders the fetched records in the table with the result count, and no empty or error state", async () => {
      server.serve(listReply(rows.records));
      show();
      expect(await screen.findByRole("table")).toBeInTheDocument();
      expectRowsShown();
      expect(screen.getByText(states.results.replace("{count}", String(rows.records.length)))).toBeInTheDocument();
      expect(screen.queryByText(states.emptyTitle)).not.toBeInTheDocument();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(screen.queryByRole("status", loading)).not.toBeInTheDocument();
    });

    it("keeps the rows on screen, with no error state, when a refresh fails", async () => {
      server.serve(listReply(rows.records), failureReply());
      const { queryClient } = show();
      await screen.findByRole("table");
      await act(async () => {
        await queryClient.invalidateQueries();
      });
      expect(server.listUrls()).toHaveLength(2);
      expectRowsShown();
      expect(screen.queryByText(states.errorTitle)).not.toBeInTheDocument();
    });

    if (forbidden) {
      it("shows the forbidden state and never calls the API for a role that may not see the screen", () => {
        server.serve(listReply(rows.records));
        nav.search = "";
        renderInApp(forbidden.screen());
        expect(screen.getByText(forbidden.title)).toBeInTheDocument();
        expect(screen.queryByRole("table")).not.toBeInTheDocument();
        expect(screen.queryByRole("status", loading)).not.toBeInTheDocument();
        expect(server.listUrls()).toHaveLength(0);
      });
    }
  });
}
