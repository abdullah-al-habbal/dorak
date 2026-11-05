import { describe, expect, it, vi } from "vitest";
import { createEmitter } from "@/utils/emitter.util";

describe("createEmitter", () => {
  it("notifies subscribers until they unsubscribe, independently per emitter", () => {
    const first = createEmitter();
    const second = createEmitter();
    const listener = vi.fn();
    const unsubscribe = first.subscribe(listener);

    first.emit();
    second.emit();
    unsubscribe();
    first.emit();

    expect(listener).toHaveBeenCalledTimes(1);
  });
});
