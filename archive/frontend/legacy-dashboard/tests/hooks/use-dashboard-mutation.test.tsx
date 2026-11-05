// @vitest-environment jsdom
import { useDashboardMutation } from "@/hooks/use-dashboard-mutation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ReactNode } from "react";

function wrapperFor(queryClient: QueryClient) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }
  return Wrapper;
}

describe("useDashboardMutation", () => {
  it("invalidates the mutated resource and every cross-linked entity resource on success", async () => {
    const queryClient = new QueryClient();
    const invalidated: unknown[][] = [];
    queryClient.invalidateQueries = (async (options: {
      queryKey: unknown[];
    }) => {
      invalidated.push(options.queryKey);
    }) as typeof queryClient.invalidateQueries;
    const { result } = renderHook(
      () => useDashboardMutation("chairs", async () => "done"),
      { wrapper: wrapperFor(queryClient) },
    );

    result.current.mutate(undefined);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidated).toContainEqual(["dashboard", "chairs"]);
    expect(invalidated).toContainEqual(["dashboard", "branches"]);
    expect(invalidated).toContainEqual(["dashboard", "services"]);
    expect(invalidated).toContainEqual(["dashboard", "stylists"]);
    expect(invalidated).toContainEqual(["dashboard", "bookings"]);
    expect(invalidated).toContainEqual(["dashboard", "overview"]);
  });
});
