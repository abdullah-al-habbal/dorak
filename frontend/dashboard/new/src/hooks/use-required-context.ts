"use client";

import { useContext, type Context } from "react";

/** Read a provider-scoped context; a missing provider is a wiring bug, so fail loudly. */
export function useRequiredContext<TValue>(context: Context<TValue | null>, consumer: string): TValue {
  const value = useContext(context);
  if (value === null) {
    throw new Error(`${consumer} must be used within its provider (${context.displayName ?? "context"})`);
  }
  return value;
}
