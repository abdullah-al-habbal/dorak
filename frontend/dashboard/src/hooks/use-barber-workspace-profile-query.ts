"use client";

import { getBarberWorkspaceProfile } from "@/services/api/barber-workspace.query";
import { useQuery } from "@tanstack/react-query";

export function useBarberWorkspaceProfileQuery() {
  return useQuery({
    queryKey: ["barber", "profile"],
    queryFn: getBarberWorkspaceProfile,
  });
}
