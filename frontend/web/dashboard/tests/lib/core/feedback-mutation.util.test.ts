import { MutationObserver, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { FeedbackMutationOptions } from "@/interfaces/core/feedback-mutation-options.interface";
import { feedbackMutationOptions } from "@/lib/feedback-mutation.util";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

interface Variables {
  action: string;
}

const FIRST_ROOT = ["first"] as const;
const SECOND_ROOT = ["second"] as const;
const FIRST_KEY = [...FIRST_ROOT, "list", { page: 1 }] as const;
const SECOND_KEY = [...SECOND_ROOT, "list"] as const;
const OTHER_KEY = ["other", "list"] as const;

function seededClient(): QueryClient {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  client.setQueryData(FIRST_KEY, ["a"]);
  client.setQueryData(SECOND_KEY, ["b"]);
  client.setQueryData(OTHER_KEY, ["c"]);
  return client;
}

function options(mutationFn: (variables: Variables) => Promise<string[]>, errorMessage?: (error: Error) => string): FeedbackMutationOptions<string[], Variables> {
  return {
    mutationFn,
    invalidate: [FIRST_ROOT, SECOND_ROOT],
    successMessage: (data, { action }) => `${action}:${data.length}`,
    errorMessage,
  };
}

describe("feedbackMutationOptions", () => {
  let client: QueryClient;

  beforeEach(() => {
    client = seededClient();
  });

  afterEach(() => {
    client.clear();
    vi.clearAllMocks();
  });

  it("toasts a success message built from the response and variables, then invalidates every listed root", async () => {
    const observer = new MutationObserver(client, feedbackMutationOptions(client, options(async () => ["x", "y"], () => "failed")));

    await expect(observer.mutate({ action: "approve" })).resolves.toEqual(["x", "y"]);

    expect(toast.success).toHaveBeenCalledWith("approve:2");
    expect(toast.error).not.toHaveBeenCalled();
    expect(client.getQueryState(FIRST_KEY)?.isInvalidated).toBe(true);
    expect(client.getQueryState(SECOND_KEY)?.isInvalidated).toBe(true);
    expect(client.getQueryState(OTHER_KEY)?.isInvalidated).toBe(false);
  });

  it("toasts the mapped error message on failure and still invalidates the roots", async () => {
    const errorMessage = vi.fn((error: Error) => `mapped:${error.message}`);
    const observer = new MutationObserver(client, feedbackMutationOptions(client, options(async () => Promise.reject(new Error("boom")), errorMessage)));

    await expect(observer.mutate({ action: "approve" })).rejects.toThrow("boom");

    expect(errorMessage).toHaveBeenCalledOnce();
    expect(toast.error).toHaveBeenCalledWith("mapped:boom");
    expect(toast.success).not.toHaveBeenCalled();
    expect(client.getQueryState(FIRST_KEY)?.isInvalidated).toBe(true);
    expect(client.getQueryState(SECOND_KEY)?.isInvalidated).toBe(true);
  });

  it("rethrows without an error toast when no error message is given", async () => {
    const observer = new MutationObserver(client, feedbackMutationOptions(client, options(async () => Promise.reject(new Error("inline")))));

    await expect(observer.mutate({ action: "approve" })).rejects.toThrow("inline");

    expect(toast.error).not.toHaveBeenCalled();
    expect(client.getQueryState(FIRST_KEY)?.isInvalidated).toBe(true);
  });

  it("resolves the mutation only after the invalidation has finished", async () => {
    const order: string[] = [];
    vi.spyOn(client, "invalidateQueries").mockImplementation(async () => {
      await Promise.resolve();
      order.push("invalidated");
    });
    const observer = new MutationObserver(client, feedbackMutationOptions(client, options(async () => [])));

    await observer.mutate({ action: "generate" });
    order.push("resolved");

    expect(order).toEqual(["invalidated", "invalidated", "resolved"]);
  });
});
