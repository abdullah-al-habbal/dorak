"use client";

import { useDictionary } from "@/hooks/use-dictionary";
import { useSession } from "@/hooks/use-session";
import type { IFloorPlanChair } from "@/services/api/dashboard/floor-plan/types/ifloor-plan.types";
import Link from "next/link";

interface IFloorPlanChairsProps {
  chairs: readonly IFloorPlanChair[];
}

/** Chair status changes (and the booking-conflict warning) live on the chair edit form. */
export function FloorPlanChairs({ chairs }: IFloorPlanChairsProps) {
  const copy = useDictionary().floorPlan;
  const session = useSession();

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold text-title-50">{copy.chairs}</h2>
      {chairs.length === 0 ? (
        <p className="text-text-secondary">{copy.noChairs}</p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {chairs.map((chair) => (
            <li
              className="flex items-center justify-between rounded-lg border border-card-border p-3 text-sm"
              key={chair.id}
            >
              <span>
                <strong>{chair.label ?? chair.id}</strong>
                <span className="ms-2 text-text-secondary">{chair.status}</span>
              </span>
              <Link
                className="underline"
                href={`/${session.actor}/chairs/${chair.id}`}
              >
                {copy.manageChair}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
