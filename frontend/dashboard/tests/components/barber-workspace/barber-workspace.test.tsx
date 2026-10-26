// @vitest-environment jsdom
import { BarberWorkspace } from "@/components/barber-workspace/barber-workspace";
import { en } from "@/i18n/messages/en.constant";
import { useBarberAppointmentsQuery } from "@/hooks/use-barber-appointments-query";
import { useBarberPortfolioQuery } from "@/hooks/use-barber-portfolio-query";
import { useBarberScheduleQuery } from "@/hooks/use-barber-schedule-query";
import { useBarberWorkspaceProfileQuery } from "@/hooks/use-barber-workspace-profile-query";
import {
  cancelBarberBooking,
  deleteBarberPortfolioPhoto,
  transitionBarberBooking,
  updateBarberProfile,
  updateBarberSchedule,
  updateBarberTravelRadius,
  updateBarberWorkstation,
  uploadBarberPortfolioPhoto,
} from "@/services/api/barber-workspace/barber-workspace.mutation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const session = { subject: "barber-1" };

// jsdom ships no CSS.escape; react-aria menus/dialogs use it internally.
vi.stubGlobal("CSS", {
  escape: (value: string) => value.replace(/["\\]/g, "\\$&"),
});

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
vi.mock("@/hooks/use-barber-schedule-query", () => ({
  useBarberScheduleQuery: vi.fn(),
}));
vi.mock("@/services/api/barber-workspace/barber-workspace.mutation", () => ({
  updateBarberWorkstation: vi.fn(),
  transitionBarberBooking: vi.fn(),
  cancelBarberBooking: vi.fn(),
  updateBarberSchedule: vi.fn(),
  updateBarberTravelRadius: vi.fn(),
  updateBarberProfile: vi.fn(),
  uploadBarberPortfolioPhoto: vi.fn(),
  deleteBarberPortfolioPhoto: vi.fn(),
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
  vi.mocked(useBarberScheduleQuery).mockReturnValue({
    data: [],
    isPending: false,
  } as never);
  vi.mocked(useBarberWorkspaceProfileQuery).mockReturnValue({
    data: { workstationOnline: false, travelRadius: 10 },
    isPending: false,
  } as never);
  vi.mocked(updateBarberWorkstation).mockResolvedValue(undefined);
  vi.mocked(transitionBarberBooking).mockResolvedValue(undefined);
  vi.mocked(cancelBarberBooking).mockResolvedValue(undefined);
  vi.mocked(updateBarberSchedule).mockResolvedValue(undefined);
  vi.mocked(updateBarberTravelRadius).mockResolvedValue(undefined);
  vi.mocked(updateBarberProfile).mockResolvedValue(undefined);
  vi.mocked(uploadBarberPortfolioPhoto).mockResolvedValue({
    id: "p-1",
    url: "https://example.test/p-1.jpg",
    sort_order: 0,
  });
  vi.mocked(deleteBarberPortfolioPhoto).mockResolvedValue(undefined);
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
    const user = userEvent.setup();
    renderWorkspace();

    await user.click(
      screen.getByRole("button", { name: en.barberWorkspace.goOnline }),
    );

    expect(updateBarberWorkstation).toHaveBeenCalledWith(true);
  });

  it("saves the travel radius with the current field value", async () => {
    const user = userEvent.setup();
    renderWorkspace();

    const input = screen.getByLabelText(en.barberWorkspace.editTravelRadius);
    await user.clear(input);
    await user.type(input, "40");
    const form = input.closest("form");
    const saveButton = form?.querySelector("button[type=submit]");
    await user.click(saveButton as HTMLButtonElement);

    await waitFor(() =>
      expect(updateBarberTravelRadius).toHaveBeenCalledWith({
        travelRadius: 40,
      }),
    );
  });

  it("saves the profile bio fields", async () => {
    const user = userEvent.setup();
    renderWorkspace();

    const bioField = screen.getByLabelText(en.barberWorkspace.bioEn);
    await user.type(bioField, "New bio");
    const form = bioField.closest("form");
    const saveButton = form?.querySelector("button[type=submit]");
    await user.click(saveButton as HTMLButtonElement);

    await waitFor(() =>
      expect(updateBarberProfile).toHaveBeenCalledWith(
        expect.objectContaining({ bioEn: "New bio" }),
      ),
    );
  });

  it("uploads the selected portfolio photo", async () => {
    const user = userEvent.setup();
    renderWorkspace();

    const file = new File(["data"], "photo.jpg", { type: "image/jpeg" });
    const input = screen
      .getByText(en.barberWorkspace.uploadPhoto)
      .parentElement?.querySelector("input[type=file]") as HTMLInputElement;
    await user.upload(input, file);

    await waitFor(() =>
      expect(uploadBarberPortfolioPhoto).toHaveBeenCalledWith(file),
    );
  });

  it("deletes a portfolio photo after confirming", async () => {
    vi.mocked(useBarberPortfolioQuery).mockReturnValue({
      data: [{ id: "p-1", url: "https://example.test/p-1.jpg" }],
      isPending: false,
    } as never);
    const user = userEvent.setup();
    renderWorkspace();

    await user.click(
      screen.getByRole("button", { name: en.barberWorkspace.deletePhoto }),
    );
    const dialog = await screen.findByRole("dialog");
    await user.click(
      within(dialog).getByRole("button", {
        name: en.barberWorkspace.deletePhoto,
      }),
    );

    await waitFor(() =>
      expect(deleteBarberPortfolioPhoto).toHaveBeenCalledWith("p-1"),
    );
  });
});
