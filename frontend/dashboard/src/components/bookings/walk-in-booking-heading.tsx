"use client";

import { useDictionary } from "@/hooks/use-dictionary";

export function WalkInBookingHeading() {
  const dictionary = useDictionary();

  return (
    <h1 className="text-2xl font-semibold text-title-50">
      {dictionary.walkInBooking.create}
    </h1>
  );
}
