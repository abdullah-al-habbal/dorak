import { QueryClient, QueryObserver, skipToken } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";

import { detailQueryOptions } from "@/lib/detail-query.util";
import { bookingKeys } from "@/lib/query-keys/bookings/booking-keys";
import { branchKeys } from "@/lib/query-keys/branches/branch-keys";
import { openingHoursKeys } from "@/lib/query-keys/hours/opening-hours-keys";

const keyFor = (id: string): readonly unknown[] => ["thing", id];

function newClient(): QueryClient {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

describe("detailQueryOptions", () => {
  let client: QueryClient = newClient();

  afterEach(() => {
    client.clear();
    client = newClient();
  });

  it("keys the read by the id and fetches that id", async () => {
    const fetcher = vi.fn(async (id: string): Promise<string> => `row-${id}`);
    const options = detailQueryOptions("7", keyFor, fetcher);

    expect(options.queryKey).toEqual(["thing", "7"]);
    expect(typeof options.queryFn).toBe("function");
    expect(options.gcTime).toBeUndefined();

    const observer = new QueryObserver(client, options);
    const unsubscribe = observer.subscribe(() => undefined);
    await vi.waitFor(() => expect(observer.getCurrentResult().data).toBe("row-7"));
    expect(fetcher).toHaveBeenCalledExactlyOnceWith("7");
    unsubscribe();
  });

  it.each([null, undefined])("is skipToken, keyed by the empty id, and never fetches while the id is %s", async (id) => {
    const fetcher = vi.fn(async (): Promise<string> => "x");
    const options = detailQueryOptions(id, keyFor, fetcher);

    expect(options.queryFn).toBe(skipToken);
    expect(options.queryKey).toEqual(["thing", ""]);

    const observer = new QueryObserver(client, options);
    const unsubscribe = observer.subscribe(() => undefined);
    await Promise.resolve();

    expect(fetcher).not.toHaveBeenCalled();
    expect(observer.getCurrentResult().fetchStatus).toBe("idle");
    expect(observer.getCurrentResult().isPending).toBe(true);
    unsubscribe();
  });

  it("starts fetching once the id arrives", async () => {
    const fetcher = vi.fn(async (id: string): Promise<string> => `row-${id}`);
    const observer = new QueryObserver(client, detailQueryOptions<string>(null, keyFor, fetcher));
    const unsubscribe = observer.subscribe(() => undefined);
    expect(fetcher).not.toHaveBeenCalled();

    observer.setOptions(detailQueryOptions("9", keyFor, fetcher));
    await vi.waitFor(() => expect(observer.getCurrentResult().data).toBe("row-9"));
    unsubscribe();
  });

  it("passes gcTime through, including 0, and leaves it out otherwise", () => {
    expect(detailQueryOptions("1", keyFor, async () => "x", { gcTime: 0 }).gcTime).toBe(0);
    expect(detailQueryOptions("1", keyFor, async () => "x", { gcTime: 5_000 }).gcTime).toBe(5_000);
    expect("gcTime" in detailQueryOptions("1", keyFor, async () => "x", {})).toBe(false);
  });

  it("keeps the keys of the hooks that moved onto it", () => {
    expect(detailQueryOptions("b1", bookingKeys.history, async () => []).queryKey).toEqual(["bookings", "history", "b1"]);
    expect(detailQueryOptions(null, bookingKeys.history, async () => []).queryKey).toEqual(["bookings", "history", ""]);
    expect(detailQueryOptions("br1", openingHoursKeys.branch, async () => []).queryKey).toEqual(openingHoursKeys.branch("br1"));
    expect(detailQueryOptions(undefined, branchKeys.detail, async () => ({})).queryKey).toEqual(branchKeys.detail(""));
    expect(detailQueryOptions("br1", branchKeys.detail, async () => ({}), { gcTime: 0 }).queryKey).toEqual(branchKeys.detail("br1"));
  });
});
