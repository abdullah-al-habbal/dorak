"use client";

import { Button } from "@/components/tailgrids/core/button";
import { useDictionary } from "@/hooks/use-dictionary";

interface IChairMaintenanceConflictProps {
  bookingIds: string[];
  canForce: boolean;
  isPending: boolean;
  onConfirm: () => void;
}

export function ChairMaintenanceConflict({
  bookingIds,
  canForce,
  isPending,
  onConfirm,
}: IChairMaintenanceConflictProps) {
  const copy = useDictionary().operations;
  const count = String(bookingIds.length);
  return (
    <div className="grid gap-2 sm:col-span-2" role="alert">
      <p className="font-medium text-input-error-focus-border">
        {copy.chairConflictTitle}
      </p>
      {canForce ? (
        <>
          <p className="text-sm text-text-100">
            {copy.chairConflictBody.replace("{count}", count)}
          </p>
          <p className="text-xs text-text-secondary">
            {copy.chairConflictBookingIds}: {bookingIds.join(", ")}
          </p>
          <div>
            <Button variant="danger" isDisabled={isPending} onPress={onConfirm}>
              {copy.chairConflictConfirm.replace("{count}", count)}
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
}
