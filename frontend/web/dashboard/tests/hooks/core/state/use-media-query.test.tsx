// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useMediaQuery } from "@/hooks/core/state/use-media-query";

function stubMatchMedia(initial: boolean) {
  let matches = initial;
  const listeners = new Set<() => void>();
  vi.stubGlobal("matchMedia", () => ({
    get matches() {
      return matches;
    },
    addEventListener: (_type: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_type: string, listener: () => void) => listeners.delete(listener),
  }));
  return {
    set(next: boolean) {
      matches = next;
      listeners.forEach((listener) => listener());
    },
    listeners,
  };
}

describe("useMediaQuery", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("follows the query as it starts and changes", () => {
    const media = stubMatchMedia(false);
    const { result } = renderHook(() => useMediaQuery("(min-width: 800px)"));
    expect(result.current).toBe(false);
    act(() => media.set(true));
    expect(result.current).toBe(true);
  });

  it("drops its listener on unmount", () => {
    const media = stubMatchMedia(true);
    const { unmount } = renderHook(() => useMediaQuery("(min-width: 800px)"));
    expect(media.listeners.size).toBe(1);
    unmount();
    expect(media.listeners.size).toBe(0);
  });
});
