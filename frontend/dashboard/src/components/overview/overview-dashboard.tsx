"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/tailgrids/core/card";
import {
  getDashboardList,
  getDashboardOverview,
} from "@/services/api/dashboard/dashboard.query";
import {
  mapBooking,
  mapChair,
} from "@/services/api/dashboard/dashboard-mapper.util";
import type { IBooking } from "@/services/api/dashboard/ibooking.types";
import type { IChair } from "@/services/api/dashboard/ichair.types";
import { useDictionary } from "@/hooks/use-dictionary";
import { useQuery } from "@tanstack/react-query";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function OverviewDashboard() {
  const dictionary = useDictionary();
  const overview = useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: getDashboardOverview,
  });
  const chairs = useQuery({
    queryKey: ["dashboard", "chairs", "overview"],
    queryFn: async () => {
      const page = await getDashboardList<unknown>("chairs", {
        page: 1,
        perPage: 100,
      });
      return page.items.map(mapChair);
    },
  });
  const bookings = useQuery({
    queryKey: ["dashboard", "bookings", "today"],
    queryFn: async () => {
      const page = await getDashboardList<unknown>("bookings", {
        page: 1,
        perPage: 100,
        dateFrom: today(),
        dateTo: today(),
      });
      return page.items.map(mapBooking);
    },
  });
  const metric = overview.data;

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold text-title-50">
        {dictionary.overviewDashboard.title}
      </h1>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          title={dictionary.overviewDashboard.todayBookings}
          value={metric?.todayBookingsCount}
        />
        <Metric
          title={dictionary.overviewDashboard.activeChairs}
          value={metric?.activeChairsCount}
        />
        <Metric
          title={dictionary.overviewDashboard.stylists}
          value={metric?.stylistsCount}
        />
        <Metric
          title={dictionary.overviewDashboard.revenue}
          value={
            metric
              ? new Intl.NumberFormat(undefined, {
                  style: "currency",
                  currency: "USD",
                }).format(metric.revenue)
              : undefined
          }
        />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{dictionary.overviewDashboard.chairOccupancy}</CardTitle>
          </CardHeader>
          <CardContent>
            <ChairOccupancy
              chairs={chairs.data ?? []}
              emptyMessage={dictionary.overviewDashboard.noChairs}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{dictionary.overviewDashboard.todaysSchedule}</CardTitle>
          </CardHeader>
          <CardContent>
            <TodayBookings
              bookings={bookings.data ?? []}
              emptyMessage={dictionary.overviewDashboard.noBookings}
              appointmentLabel={dictionary.operations.appointment}
            />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function Metric({
  title,
  value,
}: {
  title: string;
  value: number | string | undefined;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <strong className="text-2xl text-title-50">{value ?? "—"}</strong>
      </CardContent>
    </Card>
  );
}
function ChairOccupancy({
  chairs,
  emptyMessage,
}: {
  chairs: IChair[];
  emptyMessage: string;
}) {
  return chairs.length === 0 ? (
    <p className="text-text-secondary">{emptyMessage}</p>
  ) : (
    <ul className="grid gap-2 sm:grid-cols-2">
      {chairs.map((chair) => (
        <li
          className="rounded-lg border border-card-border p-3 text-sm"
          key={chair.id}
        >
          <strong>{chair.label ?? chair.id}</strong>
          <span className="ms-2 text-text-secondary">{chair.status}</span>
        </li>
      ))}
    </ul>
  );
}
function TodayBookings({
  bookings,
  emptyMessage,
  appointmentLabel,
}: {
  bookings: IBooking[];
  emptyMessage: string;
  appointmentLabel: string;
}) {
  return bookings.length === 0 ? (
    <p className="text-text-secondary">{emptyMessage}</p>
  ) : (
    <ol className="space-y-3">
      {bookings.map((booking) => (
        <li
          className="flex justify-between border-b border-card-border pb-3 text-sm"
          key={booking.id}
        >
          <span>
            {booking.barber?.name.en ??
              booking.chair?.label ??
              appointmentLabel}
          </span>
          <span>{booking.timeSlot}</span>
        </li>
      ))}
    </ol>
  );
}
