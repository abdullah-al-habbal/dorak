import { MutationObserver, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { HttpStatus } from "@/enums/http-status.enum";
import { deleteFeedbackOptions } from "@/lib/delete-mutation.util";
import { feedbackMutationOptions } from "@/lib/feedback-mutation.util";
import { ApiClientError } from "@/services/api/core/api-client-error";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const ROOT = ["rows"] as const;
const OTHER_ROOT = ["others"] as const;
const LIST_KEY = [...ROOT, "list"] as const;
const OTHER_KEY = [...OTHER_ROOT, "list"] as const;
const UNRELATED_KEY = ["unrelated"] as const;
const MESSAGES = { deleted: "deleted", deleteFailed: "delete failed" };

function seededClient(): QueryClient {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  client.setQueryData(LIST_KEY, ["a"]);
  client.setQueryData(OTHER_KEY, ["b"]);
  client.setQueryData(UNRELATED_KEY, ["c"]);
  return client;
}

function conflict(): ApiClientError {
  return new ApiClientError({ status: HttpStatus.Conflict, code: "x", message: "Has live bookings" });
}

describe("deleteFeedbackOptions", () => {
  let client: QueryClient;

  beforeEach(() => {
    client = seededClient();
  });

  afterEach(() => {
    client.clear();
    vi.clearAllMocks();
  });

  function observer(remove: (id: string) => Promise<void>, surfaceConflict?: boolean): MutationObserver<void, Error, string> {
    const options = deleteFeedbackOptions({ remove, invalidate: [ROOT, OTHER_ROOT], messages: MESSAGES, surfaceConflict });
    return new MutationObserver(client, feedbackMutationOptions(client, options));
  }

  it("removes the id, toasts the deleted copy and refreshes every listed root", async () => {
    const remove = vi.fn<(id: string) => Promise<void>>(async () => undefined);

    await observer(remove).mutate("id-1");

    expect(remove.mock.calls[0]?.[0]).toBe("id-1");
    expect(toast.success).toHaveBeenCalledWith("deleted");
    expect(toast.error).not.toHaveBeenCalled();
    expect(client.getQueryState(LIST_KEY)?.isInvalidated).toBe(true);
    expect(client.getQueryState(OTHER_KEY)?.isInvalidated).toBe(true);
    expect(client.getQueryState(UNRELATED_KEY)?.isInvalidated).toBe(false);
  });

  it("toasts the generic failure for a 409 unless the conflict is surfaced", async () => {
    await expect(observer(async () => Promise.reject(conflict())).mutate("id-1")).rejects.toThrow();

    expect(toast.error).toHaveBeenCalledWith("delete failed");
    expect(client.getQueryState(LIST_KEY)?.isInvalidated).toBe(true);
  });

  it("toasts the backend's 409 reason when the conflict is surfaced", async () => {
    await expect(observer(async () => Promise.reject(conflict()), true).mutate("id-1")).rejects.toThrow();

    expect(toast.error).toHaveBeenCalledWith("Has live bookings");
  });

  it("falls back to the generic failure for other errors even when the conflict is surfaced", async () => {
    await expect(observer(async () => Promise.reject(new Error("network")), true).mutate("id-1")).rejects.toThrow("network");

    expect(toast.error).toHaveBeenCalledWith("delete failed");
  });
});
