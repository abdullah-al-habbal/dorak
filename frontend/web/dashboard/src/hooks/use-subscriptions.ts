"use client";

import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";

import { subscriptionKeys } from "@/lib/query-keys/plans/subscription-keys";
import { fetchSubscriptions } from "@/services/api/query/subscriptions.query";
import type { Subscription } from "@/types/subscription.type";

export function useSubscriptions(): UseQueryResult<Subscription[]> {
  return useQuery({ queryKey: subscriptionKeys.current(), queryFn: fetchSubscriptions });
}
