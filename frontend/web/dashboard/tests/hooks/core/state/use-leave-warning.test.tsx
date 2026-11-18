// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useLeaveWarning } from "@/hooks/core/state/use-leave-warning";

function unloadWasPrevented(): boolean {
  const event = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(event);
  return event.defaultPrevented;
}

describe("useLeaveWarning", () => {
  it("asks the browser to confirm only while active", () => {
    const { rerender } = renderHook(({ active }) => useLeaveWarning(active), { initialProps: { active: false } });
    expect(unloadWasPrevented()).toBe(false);
    rerender({ active: true });
    expect(unloadWasPrevented()).toBe(true);
    rerender({ active: false });
    expect(unloadWasPrevented()).toBe(false);
  });

  it("stops warning once the component unmounts", () => {
    const { unmount } = renderHook(() => useLeaveWarning(true));
    unmount();
    expect(unloadWasPrevented()).toBe(false);
  });
});
