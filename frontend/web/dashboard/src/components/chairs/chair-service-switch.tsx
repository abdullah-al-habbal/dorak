"use client";

import type { JSX } from "react";

import { Switch } from "@/components/ui/switch";
import { ChairStatus } from "@/enums/chair-status.enum";
import { useDictionary } from "@/hooks/core/use-dictionary";
import type { Chair } from "@/types/chairs/chair.type";

interface ChairServiceSwitchProps {
  chair: Chair;
  disabled: boolean;
  onToggle: (chair: Chair, inService: boolean) => void;
}

/** On means the chair takes bookings; off means maintenance. */
export function ChairServiceSwitch({ chair, disabled, onToggle }: ChairServiceSwitchProps): JSX.Element {
  const { chairs } = useDictionary();
  const inService = chair.configured_status !== ChairStatus.Maintenance;
  const label = chair.label ?? "";

  return (
    <Switch
      checked={inService}
      disabled={disabled}
      aria-label={(inService ? chairs.toggle.maintenance : chairs.toggle.inService).replace("{name}", label)}
      onCheckedChange={(checked) => onToggle(chair, checked)}
    />
  );
}
