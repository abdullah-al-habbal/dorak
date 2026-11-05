"use client";

import { AlertTriangleIcon, CalendarX2Icon, LockIcon, SearchXIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDictionary } from "@/hooks/use-dictionary";

function Notice({ icon, title, body, children, alert }: { icon: ReactNode; title: string; body: string; children?: ReactNode; alert?: boolean }) {
  return (
    <div role={alert ? "alert" : "status"} className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-border-strong bg-card px-6 py-10 sm:items-center sm:text-center">
      <span className="text-muted-foreground" aria-hidden>{icon}</span>
      <div className="flex max-w-prose flex-col gap-1">
        <h2 className="font-heading text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{body}</p>
      </div>
      {children}
    </div>
  );
}

export function BookingsEmpty() {
  const { bookings } = useDictionary();
  return <Notice icon={<CalendarX2Icon className="size-8" />} title={bookings.states.emptyTitle} body={bookings.states.emptyBody} />;
}

export function BookingsFilteredEmpty({ onClear }: { onClear: () => void }) {
  const { bookings } = useDictionary();
  return (
    <Notice icon={<SearchXIcon className="size-8" />} title={bookings.states.filteredTitle} body={bookings.states.filteredBody}>
      <Button variant="outline" onClick={onClear}>{bookings.filters.clear}</Button>
    </Notice>
  );
}

export function BookingsError({ onRetry }: { onRetry: () => void }) {
  const { bookings, common } = useDictionary();
  return (
    <Notice alert icon={<AlertTriangleIcon className="size-8" />} title={bookings.states.errorTitle} body={bookings.states.errorBody}>
      <Button onClick={onRetry}>{common.retry}</Button>
    </Notice>
  );
}

export function BookingsForbidden() {
  const { bookings } = useDictionary();
  return <Notice icon={<LockIcon className="size-8" />} title={bookings.states.forbiddenTitle} body={bookings.states.forbiddenBody} />;
}

const SKELETON_ROWS = 6;

export function BookingsSkeleton() {
  const { common } = useDictionary();
  return (
    <div role="status" aria-busy="true" aria-label={common.loading} className="flex flex-col gap-2">
      {Array.from({ length: SKELETON_ROWS }, (_, index) => (
        <Skeleton key={index} className="h-[60px] w-full rounded-lg motion-reduce:animate-none" />
      ))}
    </div>
  );
}
