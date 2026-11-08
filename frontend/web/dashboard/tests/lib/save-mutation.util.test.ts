import { MutationObserver, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { SaveVariables } from "@/interfaces/save-variables.interface";
import { feedbackMutationOptions } from "@/lib/feedback-mutation.util";
import { saveFeedbackOptions } from "@/lib/save-mutation.util";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

interface Payload {
  name: string;
}
interface Saved {
  id: string;
  name: string;
}

const ROOT = ["rows"] as const;
const LIST_KEY = [...ROOT, "list"] as const;
const UNRELATED_KEY = ["unrelated"] as const;
const MESSAGES = { created: "created", updated: "updated" };

describe("saveFeedbackOptions", () => {
  let client: QueryClient;
  const create = vi.fn(async ({ name }: Payload): Promise<Saved> => ({ id: "new", name }));
  const update = vi.fn(async (id: string, { name }: Payload): Promise<Saved> => ({ id, name }));

  beforeEach(() => {
    client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    client.setQueryData(LIST_KEY, ["a"]);
    client.setQueryData(UNRELATED_KEY, ["b"]);
  });

  afterEach(() => {
    client.clear();
    vi.clearAllMocks();
  });

  function observer(createFn: (payload: Payload) => Promise<Saved> = create): MutationObserver<Saved, Error, SaveVariables<Payload>> {
    const options = saveFeedbackOptions({ create: createFn, update, invalidate: [ROOT], messages: MESSAGES });
    return new MutationObserver(client, feedbackMutationOptions(client, options));
  }

  it("creates without an id, toasts the created copy and refreshes the listed root", async () => {
    await expect(observer().mutate({ payload: { name: "A" } })).resolves.toEqual({ id: "new", name: "A" });

    expect(create).toHaveBeenCalledWith({ name: "A" });
    expect(update).not.toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith("created");
    expect(client.getQueryState(LIST_KEY)?.isInvalidated).toBe(true);
    expect(client.getQueryState(UNRELATED_KEY)?.isInvalidated).toBe(false);
  });

  it("updates with an id and toasts the updated copy", async () => {
    await expect(observer().mutate({ id: "id-1", payload: { name: "B" } })).resolves.toEqual({ id: "id-1", name: "B" });

    expect(update).toHaveBeenCalledWith("id-1", { name: "B" });
    expect(create).not.toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith("updated");
  });

  it("leaves failures to the form: no toast, but the root is still refreshed", async () => {
    await expect(observer(async () => Promise.reject(new Error("invalid"))).mutate({ payload: { name: "C" } })).rejects.toThrow("invalid");

    expect(toast.error).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
    expect(client.getQueryState(LIST_KEY)?.isInvalidated).toBe(true);
  });
});
