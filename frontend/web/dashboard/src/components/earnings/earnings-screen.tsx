"use client";

import type { JSX } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { EarningsContent } from "@/components/earnings/earnings-content";
import { AuthActor } from "@/enums/auth-actor.enum";
import { useDictionary } from "@/hooks/core/use-dictionary";

/** The backend rejects platform admins, so they get an explanation instead of a failing request. */
export function EarningsScreen({ actor }: { actor: AuthActor }): JSX.Element {
  const { earnings: t } = useDictionary();
  if (actor === AuthActor.Admin) {
    return <EmptyState variant="forbidden" title={t.states.forbiddenTitle} body={t.states.forbiddenBody} />;
  }
  return <EarningsContent actor={actor} />;
}
