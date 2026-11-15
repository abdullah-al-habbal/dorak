import { MutationObserver, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { OptimisticToggleMutationOptions } from "@/interfaces/core/query/optimistic-toggle-mutation-options.interface";
import { optimisticToggleMutationOptions } from "@/lib/core/query/optimistic-toggle-mutation.util";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

interface Row {
  id: string;
  on: boolean;
}
interface Page {
  items: Row[];
}
interface Variables {
  id: string;
  on: boolean;
}

const ROOT = ["rows"] as const;
const FIRST_KEY = [...ROOT, "list", { page: 1 }] as const;
const SECOND_KEY = [...ROOT, "list", { page: 2 }] as const;
const OTHER_KEY = ["other", "list"] as const;
const FIRST_PAGE: Page = { items: [{ id: "a", on: false }, { id: "b", on: true }] };
const SECOND_PAGE: Page = { items: [{ id: "a", on: false }] };
const OTHER_PAGE: Page = { items: [{ id: "a", on: false }] };

function patch(page: Page | undefined, { id, on }: Variables): Page | undefined {
  if (!page?.items.some((row) => row.id === id)) return page;
  return { ...page, items: page.items.map((row) => (row.id === id ? { ...row, on } : row)) };
}

function seededClient(): QueryClient {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  client.setQueryData(FIRST_KEY, FIRST_PAGE);
  client.setQueryData(SECOND_KEY, SECOND_PAGE);
  client.setQueryData(OTHER_KEY, OTHER_PAGE);
  return client;
}

function toggleOptions(mutationFn: (variables: Variables) => Promise<Row>, failureMessage?: string): OptimisticToggleMutationOptions<Row, Variables, Page> {
  return { queryKey: ROOT, mutationFn, patch, successMessage: ({ on }) => (on ? "on" : "off"), failureMessage };
}

describe("optimisticToggleMutationOptions", () => {
  let client: QueryClient;

  beforeEach(() => {
    client = seededClient();
  });

  afterEach(() => {
    client.clear();
    vi.clearAllMocks();
  });

  it("patches every cached entry under the root before the request resolves, and leaves other roots alone", async () => {
    let resolve: (row: Row) => void = () => undefined;
    const pending = new Promise<Row>((done) => {
      resolve = done;
    });
    const observer = new MutationObserver(client, optimisticToggleMutationOptions(client, toggleOptions(() => pending)));

    const run = observer.mutate({ id: "a", on: true });
    await vi.waitFor(() => expect(client.getQueryData<Page>(FIRST_KEY)?.items[0]?.on).toBe(true));
    expect(client.getQueryData<Page>(SECOND_KEY)?.items[0]?.on).toBe(true);
    expect(client.getQueryData<Page>(FIRST_KEY)?.items[1]).toEqual({ id: "b", on: true });
    expect(client.getQueryData(OTHER_KEY)).toBe(OTHER_PAGE);

    resolve({ id: "a", on: true });
    await run;
  });

  it("toasts the success message for the variables and invalidates the root once settled", async () => {
    const observer = new MutationObserver(client, optimisticToggleMutationOptions(client, toggleOptions(async () => ({ id: "a", on: false }), "failed")));

    await observer.mutate({ id: "a", on: false });

    expect(toast.success).toHaveBeenCalledWith("off");
    expect(toast.error).not.toHaveBeenCalled();
    expect(client.getQueryState(FIRST_KEY)?.isInvalidated).toBe(true);
    expect(client.getQueryState(SECOND_KEY)?.isInvalidated).toBe(true);
    expect(client.getQueryState(OTHER_KEY)?.isInvalidated).toBe(false);
  });

  it("also invalidates the extra roots once settled, without patching them", async () => {
    const options = { ...toggleOptions(async () => ({ id: "a", on: true }), "failed"), invalidate: [OTHER_KEY] };
    const observer = new MutationObserver(client, optimisticToggleMutationOptions(client, options));

    await observer.mutate({ id: "a", on: true });

    expect(client.getQueryState(FIRST_KEY)?.isInvalidated).toBe(true);
    expect(client.getQueryState(OTHER_KEY)?.isInvalidated).toBe(true);
    expect(client.getQueryData(OTHER_KEY)).toEqual(OTHER_PAGE);
  });

  it("restores every snapshot and toasts the failure message when the request fails", async () => {
    const observer = new MutationObserver(client, optimisticToggleMutationOptions(client, toggleOptions(async () => Promise.reject(new Error("boom")), "failed")));

    await expect(observer.mutate({ id: "a", on: true })).rejects.toThrow("boom");

    expect(client.getQueryData(FIRST_KEY)).toEqual(FIRST_PAGE);
    expect(client.getQueryData(SECOND_KEY)).toEqual(SECOND_PAGE);
    expect(toast.error).toHaveBeenCalledWith("failed");
    expect(toast.success).not.toHaveBeenCalled();
    expect(client.getQueryState(FIRST_KEY)?.isInvalidated).toBe(true);
  });

  it("rolls back without a toast when no failure message is given", async () => {
    const observer = new MutationObserver(client, optimisticToggleMutationOptions(client, toggleOptions(async () => Promise.reject(new Error("conflict")))));

    await expect(observer.mutate({ id: "a", on: true })).rejects.toThrow("conflict");

    expect(client.getQueryData(FIRST_KEY)).toEqual(FIRST_PAGE);
    expect(toast.error).not.toHaveBeenCalled();
  });
});
