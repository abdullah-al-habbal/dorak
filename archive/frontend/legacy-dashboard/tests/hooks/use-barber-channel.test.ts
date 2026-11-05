import { useBarberChannel } from "@/hooks/use-barber-channel";
import { realtimeEcho } from "@/services/realtime/echo-client";
import { describe, expect, it, vi } from "vitest";

const invalidateQueries = vi.fn();

vi.mock("react", () => ({ useEffect: (effect: () => void) => effect() }));
vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries }),
}));
vi.mock("@/services/realtime/echo-client", () => ({ realtimeEcho: vi.fn() }));

describe("useBarberChannel", () => {
  it("invalidates appointments and notifications on booking events", () => {
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

    useBarberChannel("9");
    handlers[".booking.status.updated"]();

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["barber", "appointments"],
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["notifications"],
    });
  });
});
