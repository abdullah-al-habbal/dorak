// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { useListQuery } from "@/hooks/core/query/use-list-query";

/** A fresh client per test, held across rerenders so the cache survives them. */
function createWrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

describe("useListQuery", () => {
  it("fetches when enabled and returns the data", async () => {
    const fetcher = vi.fn().mockResolvedValue(["a"]);
    const { result } = renderHook(() => useListQuery(["list"], fetcher), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(["a"]);
  });

  it("stays idle while disabled", () => {
    const fetcher = vi.fn().mockResolvedValue([]);
    const { result } = renderHook(() => useListQuery(["list"], fetcher, false), { wrapper: createWrapper() });
    expect(fetcher).not.toHaveBeenCalled();
    expect(result.current.fetchStatus).toBe("idle");
  });

  it("keeps the previous result on screen while the next key loads", async () => {
    let resolveSecond: (value: string[]) => void = () => undefined;
    const fetcher = vi.fn((page: number) => (page === 1 ? Promise.resolve(["one"]) : new Promise<string[]>((resolve) => (resolveSecond = resolve))));
    const { result, rerender } = renderHook(({ page }) => useListQuery(["list", page], () => fetcher(page)), { wrapper: createWrapper(), initialProps: { page: 1 } });
    await waitFor(() => expect(result.current.data).toEqual(["one"]));
    rerender({ page: 2 });
    expect(result.current.data).toEqual(["one"]);
    expect(result.current.isPlaceholderData).toBe(true);
    resolveSecond(["two"]);
    await waitFor(() => expect(result.current.data).toEqual(["two"]));
  });
});
