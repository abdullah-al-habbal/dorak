import {
  deleteBarberPortfolioPhoto,
  transitionBarberBooking,
  updateBarberProfile,
  updateBarberSchedule,
  updateBarberTravelRadius,
  uploadBarberPortfolioPhoto,
} from "@/services/api/barber-workspace/barber-workspace.mutation";
import { api } from "@/services/api/core/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/services/api/core/client", () => ({
  api: {
    patch: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
    upload: vi.fn(),
  },
}));

beforeEach(() => {
  vi.mocked(api.patch).mockReset();
  vi.mocked(api.delete).mockReset();
  vi.mocked(api.upload).mockReset();
});

describe("updateBarberSchedule", () => {
  it("maps camelCase form fields to the backend's snake_case schedule shape", () => {
    updateBarberSchedule({
      schedule: [
        { dayOfWeek: 1, startTime: "09:00", endTime: "17:00", isActive: true },
      ],
    });

    expect(api.patch).toHaveBeenCalledWith("/barber/schedule", {
      schedule: [
        {
          day_of_week: 1,
          start_time: "09:00",
          end_time: "17:00",
          is_active: true,
        },
      ],
    });
  });
});

describe("updateBarberTravelRadius", () => {
  it("sends the travel radius as snake_case", () => {
    updateBarberTravelRadius({ travelRadiusKm: 25 });

    expect(api.patch).toHaveBeenCalledWith("/barber/travel-radius", {
      travel_radius_km: 25,
    });
  });
});

describe("updateBarberProfile", () => {
  it("sends bilingual bio fields", () => {
    updateBarberProfile({ bioEn: "Hello", bioAr: "مرحبا" });

    expect(api.patch).toHaveBeenCalledWith("/barber/profile", {
      bio: { en: "Hello", ar: "مرحبا" },
    });
  });
});

describe("transitionBarberBooking", () => {
  it.each(["accept", "start", "complete", "no-show"] as const)(
    "sends a PATCH to the %s transition route",
    (action) => {
      transitionBarberBooking("b-1", action);

      expect(api.patch).toHaveBeenCalledWith(`/barber/bookings/b-1/${action}`);
    },
  );
});

describe("uploadBarberPortfolioPhoto", () => {
  it("uploads the file under the photo field", () => {
    const file = new File(["data"], "photo.jpg", { type: "image/jpeg" });

    uploadBarberPortfolioPhoto(file);

    expect(api.upload).toHaveBeenCalledWith(
      "/barber/portfolio",
      expect.any(FormData),
    );
    const formData = vi.mocked(api.upload).mock.calls[0]?.[1] as FormData;
    expect(formData.get("photo")).toBe(file);
  });
});

describe("deleteBarberPortfolioPhoto", () => {
  it("deletes by photo id", () => {
    deleteBarberPortfolioPhoto("photo-1");

    expect(api.delete).toHaveBeenCalledWith("/barber/portfolio/photo-1");
  });
});
