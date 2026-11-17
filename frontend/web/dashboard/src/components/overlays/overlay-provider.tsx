"use client";

import { useMemo, useState } from "react";
import type { JSX, ReactNode } from "react";

import { OverlayContext } from "@/components/overlays/overlay-context";
import { OverlayHost } from "@/components/overlays/overlay-host";
import type { OverlayContextValue } from "@/interfaces/ui/shell/overlay-context-value.interface";
import type { OverlayRequest } from "@/types/ui/overlay-request.type";

export function OverlayProvider({ children }: { children: ReactNode }): JSX.Element {
  const [request, setRequest] = useState<OverlayRequest | null>(null);

  const value = useMemo<OverlayContextValue>(
    () => ({ request, open: setRequest, close: () => setRequest(null) }),
    [request],
  );

  return (
    <OverlayContext value={value}>
      {children}
      <OverlayHost request={request} onClose={value.close} />
    </OverlayContext>
  );
}
