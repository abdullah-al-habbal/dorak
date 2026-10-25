"use client";

import { getBarberPortfolio } from "@/services/api/barber-workspace.query";
import { useQuery } from "@tanstack/react-query";

export function useBarberPortfolioQuery() {
  return useQuery({
    queryKey: ["barber", "portfolio"],
    queryFn: getBarberPortfolio,
  });
}
