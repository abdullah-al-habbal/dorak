"use client";

import { useContext } from "react";

import { OverlayContext } from "@/components/overlays/overlay-context";
import type { OverlayContextValue } from "@/interfaces/ui/overlay-context-value.interface";

export function useOverlay(): OverlayContextValue {
  const value = useContext(OverlayContext);
  if (!value) throw new Error("useOverlay must be used inside <OverlayProvider>.");
  return value;
}
