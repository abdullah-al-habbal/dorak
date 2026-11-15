"use client";

import type { JSX } from "react";

import { Switch } from "@/components/ui/switch";
import { BarberStatus } from "@/enums/barber-status.enum";
import { useI18n } from "@/hooks/core/use-i18n";
import { localizedText } from "@/lib/core/booking-format.util";
import type { Stylist } from "@/types/stylists/stylist.type";

interface StylistActiveSwitchProps {
  stylist: Stylist;
  disabled: boolean;
  onToggle: (stylist: Stylist, active: boolean) => void;
}

/** On means enabled. A pending stylist reads as off and can only be switched on. */
export function StylistActiveSwitch({ stylist, disabled, onToggle }: StylistActiveSwitchProps): JSX.Element {
  const { locale, dictionary } = useI18n();
  const { toggle } = dictionary.stylists;
  const name = localizedText(stylist.name, locale);
  const active = stylist.status === BarberStatus.Enabled;

  return (
    <Switch
      checked={active}
      disabled={disabled}
      aria-label={(active ? toggle.deactivate : toggle.activate).replace("{name}", name)}
      onCheckedChange={(checked) => onToggle(stylist, checked)}
    />
  );
}
