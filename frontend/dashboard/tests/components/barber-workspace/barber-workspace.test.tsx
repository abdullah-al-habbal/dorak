// @vitest-environment jsdom
import { BarberWorkspace } from "@/components/barber-workspace/barber-workspace";
import { en } from "@/i18n/messages/en.constant";
import { useBarberAppointmentsQuery } from "@/hooks/use-barber-appointments-query";
import { useBarberPortfolioQuery } from "@/hooks/use-barber-portfolio-query";
import { useBarberWorkspaceProfileQuery } from "@/hooks/use-barber-workspace-profile-query";
import {
  cancelBarberBooking,
  transitionBarberBooking,
  updateBarberWorkstation,
} from "@/services/api/barber-workspace/barber-workspace.mutation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const session = { subject: "barber-1" };

vi.mock("@/hooks/use-session", () => ({ useSession: () => session }));
vi.mock("@/hooks/use-dictionary", async () => {
  const { en: dictionary } = await vi.importActual<
    typeof import("@/i18n/messages/en.constant")
  >("@/i18n/messages/en.constant");
  return { useDictionary: () => dictionary };
});
vi.mock("@/hooks/use-barber-channel", () => ({ useBarberChannel: vi.fn() }));
vi.mock("@/hooks/use-barber-appointments-query", () => ({
  useBarberAppointmentsQuery: vi.fn(),
}));
vi.mock("@/hooks/use-barber-workspace-profile-query", () => ({
  useBarberWorkspaceProfileQuery: vi.fn(),
}));
vi.mock("@/hooks/use-barber-portfolio-query", () => ({
  useBarberPortfolioQuery: vi.fn(),
}));
vi.mock("@/services/api/barber-workspace/barber-workspace.mutation", () => ({
  updateBarberWorkstation: vi.fn(),
  transitionBarberBooking: vi.fn(),
  cancelBarberBooking: vi.fn(),
}));

function renderWorkspace() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <BarberWorkspace />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.mocked(useBarberAppointmentsQuery).mockReturnValue({
    data: { items: [] },
    isPending: false,
  } as never);
  vi.mocked(useBarberPortfolioQuery).mockReturnValue({
    data: [],
    isPending: false,
  } as never);
  vi.mocked(updateBarberWorkstation).mockResolvedValue(undefined);
  vi.mocked(transitionBarberBooking).mockResolvedValue(undefined);
  vi.mocked(cancelBarberBooking).mockResolvedValue(undefined);
});

afterEach(cleanup);

describe("BarberWorkspace", () => {
  it("sends online:false when the barber is currently online", async () => {
    vi.mocked(useBarberWorkspaceProfileQuery).mockReturnValue({
      data: { workstationOnline: true, travelRadius: 10 },
      isPending: false,
    } as never);
    const user = userEvent.setup();
    renderWorkspace();

    await user.click(
      screen.getByRole("button", { name: en.barberWorkspace.goOffline }),
    );

    expect(updateBarberWorkstation).toHaveBeenCalledWith(false);
  });

  it("sends online:true when the barber is currently offline", async () => {
    vi.mocked(useBarberWorkspaceProfileQuery).mockReturnValue({
      data: { workstationOnline: false, travelRadius: 10 },
      isPending: false,
    } as never);
    const user = userEvent.setup();
    renderWorkspace();

    await user.click(
      screen.getByRole("button", { name: en.barberWorkspace.goOnline }),
    );

    expect(updateBarberWorkstation).toHaveBeenCalledWith(true);
  });
});
