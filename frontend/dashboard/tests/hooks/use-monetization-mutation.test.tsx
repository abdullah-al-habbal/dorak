// @vitest-environment jsdom
import { useMonetizationMutation } from "@/hooks/use-monetization-mutation";
import { MONETIZATION_QUERY_KEYS } from "@/services/api/dashboard/monetization/monetization.constant";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

const { notifySuccess, notifyApiError } = vi.hoisted(() => ({
  notifySuccess: vi.fn(),
  notifyApiError: vi.fn(),
}));
vi.mock("@/services/api/core/notifications", () => ({
  notifySuccess,
  notifyApiError,
}));
vi.mock("@/hooks/use-dictionary", () => ({ useDictionary: () => ({}) }));

function wrapperFor(queryClient: QueryClient) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }
  return Wrapper;
}

describe("useMonetizationMutation", () => {
  it("announces success, refreshes every monetization list and calls onSuccess", async () => {
    const queryClient = new QueryClient();
    const invalidated: unknown[] = [];
    queryClient.invalidateQueries = (async (options: { queryKey: unknown }) => {
      invalidated.push(options.queryKey);
    }) as typeof queryClient.invalidateQueries;
    const onSuccess = vi.fn();
    const { result } = renderHook(
      () =>
        useMonetizationMutation(async () => "done", {
          successMessage: "Saved.",
          onSuccess,
        }),
      { wrapper: wrapperFor(queryClient) },
    );

    result.current.mutate(undefined);
    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith("done"));

    expect(notifySuccess).toHaveBeenCalledWith("Saved.");
    expect(invalidated).toEqual(Object.values(MONETIZATION_QUERY_KEYS));
  });

  it("reports a failure through the API error notifier", async () => {
    const failure = new Error("nope");
    const { result } = renderHook(
      () =>
        useMonetizationMutation(
          async () => {
            throw failure;
          },
          { successMessage: "Saved." },
        ),
      { wrapper: wrapperFor(new QueryClient()) },
    );

    result.current.mutate(undefined);
    await waitFor(() => expect(notifyApiError).toHaveBeenCalled());

    expect(notifyApiError.mock.calls[0]?.[0]).toBe(failure);
  });
});
