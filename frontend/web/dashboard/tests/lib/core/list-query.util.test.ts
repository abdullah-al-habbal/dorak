import { QueryClient, QueryObserver, keepPreviousData } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";

import { listQueryOptions } from "@/lib/list-query.util";

const FIRST_KEY = ["rows", "list", { page: 1 }] as const;
const SECOND_KEY = ["rows", "list", { page: 2 }] as const;

function newClient(): QueryClient {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

describe("listQueryOptions", () => {
  let client: QueryClient = newClient();

  afterEach(() => {
    client.clear();
    client = newClient();
  });

  it("passes the key and fetcher through, keeps the previous data and is enabled by default", () => {
    const queryFn = async (): Promise<string[]> => ["a"];
    const options = listQueryOptions(FIRST_KEY, queryFn);

    expect(options.queryKey).toBe(FIRST_KEY);
    expect(options.queryFn).toBe(queryFn);
    expect(options.placeholderData).toBe(keepPreviousData);
    expect(options.enabled).toBe(true);
  });

  it("keeps the previous page on screen as placeholder data while the next key loads", async () => {
    const observer = new QueryObserver(client, listQueryOptions<string[]>(FIRST_KEY, async () => ["page-1"]));
    const unsubscribe = observer.subscribe(() => undefined);
    await vi.waitFor(() => expect(observer.getCurrentResult().data).toEqual(["page-1"]));

    let release: () => void = () => undefined;
    const pending = new Promise<void>((done) => {
      release = done;
    });
    observer.setOptions(listQueryOptions<string[]>(SECOND_KEY, async () => {
      await pending;
      return ["page-2"];
    }));

    const loading = observer.getCurrentResult();
    expect(loading.data).toEqual(["page-1"]);
    expect(loading.isPlaceholderData).toBe(true);

    release();
    await vi.waitFor(() => expect(observer.getCurrentResult().data).toEqual(["page-2"]));
    expect(observer.getCurrentResult().isPlaceholderData).toBe(false);
    unsubscribe();
  });

  it("does not fetch while disabled", async () => {
    const queryFn = vi.fn(async (): Promise<string[]> => ["a"]);
    const observer = new QueryObserver(client, listQueryOptions(FIRST_KEY, queryFn, false));
    const unsubscribe = observer.subscribe(() => undefined);

    await Promise.resolve();

    expect(queryFn).not.toHaveBeenCalled();
    expect(observer.getCurrentResult().fetchStatus).toBe("idle");
    unsubscribe();
  });
});
