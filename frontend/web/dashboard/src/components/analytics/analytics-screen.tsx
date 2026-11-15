"use client";

import type { JSX } from "react";

import { AnalyticsContent } from "@/components/analytics/analytics-content";
import { EmptyState } from "@/components/common/empty-state";
import { AuthActor } from "@/enums/access/auth-actor.enum";
import { useDictionary } from "@/hooks/core/state/use-dictionary";

/**
 * Platform analytics are admin only. Owners, managers and barbers read their own figures on Earnings
 * (brand, branch and personal scope), so the proxy and the backend refuse this route to them.
 */
export function AnalyticsScreen({ actor }: { actor: AuthActor }): JSX.Element {
  const { analytics: t } = useDictionary();
  if (actor !== AuthActor.Admin) {
    return <EmptyState variant="forbidden" title={t.states.forbiddenTitle} body={t.states.forbiddenBody} />;
  }
  return <AnalyticsContent />;
}
