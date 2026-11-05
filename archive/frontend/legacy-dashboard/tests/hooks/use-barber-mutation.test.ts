import { useBarberMutation } from "@/hooks/use-barber-mutation";
import { describe, expect, it, vi } from "vitest";

const invalidateQueries = vi.fn();
let capturedOnSuccess: (() => void | Promise<void>) | undefined;

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries }),
  useMutation: (options: { onSuccess?: () => void | Promise<void> }) => {
    capturedOnSuccess = options.onSuccess;
    return options;
  },
}));

describe("useBarberMutation", () => {
  it("invalidates the barber appointments cache on success", async () => {
    useBarberMutation("appointments", async () => undefined);

    await capturedOnSuccess?.();

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["barber", "appointments"],
    });
  });

  it("invalidates the barber profile cache on success", async () => {
    useBarberMutation("profile", async () => undefined);

    await capturedOnSuccess?.();

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["barber", "profile"],
    });
  });
});
