import { useBranchChannel } from "@/hooks/use-branch-channel";
import { realtimeEcho } from "@/services/realtime/echo-client";
import { describe, expect, it, vi } from "vitest";

const invalidateQueries = vi.fn();

vi.mock("react", () => ({ useEffect: (effect: () => void) => effect() }));
vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries }),
}));
vi.mock("@/services/realtime/echo-client", () => ({ realtimeEcho: vi.fn() }));

describe("useBranchChannel", () => {
  it("invalidates bookings, overview and notifications when a booking is cancelled", () => {
    const handlers: Record<string, () => void> = {};
    const channel = {
      listen: vi.fn((event: string, handler: () => void) => {
        handlers[event] = handler;
        return channel;
      }),
    };
    vi.mocked(realtimeEcho).mockReturnValue({
      private: vi.fn(() => channel),
      leave: vi.fn(),
    } as never);

    useBranchChannel("7");
    handlers[".booking.cancelled"]();

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["dashboard", "bookings"],
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["dashboard", "overview"],
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["notifications"],
    });
    expect(Object.keys(handlers)).toContain(".booking.rescheduled");
  });
});
