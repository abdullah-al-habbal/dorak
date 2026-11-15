"use client";

import type { JSX } from "react";

import { Switch } from "@/components/ui/switch";
import { useI18n } from "@/hooks/use-i18n";
import { localizedText } from "@/lib/booking-format.util";
import type { Service } from "@/types/services/service.type";

interface ServiceActiveSwitchProps {
  service: Service;
  disabled: boolean;
  onToggle: (service: Service, active: boolean) => void;
}

export function ServiceActiveSwitch({ service, disabled, onToggle }: ServiceActiveSwitchProps): JSX.Element {
  const { locale, dictionary } = useI18n();
  const { toggle } = dictionary.services;
  const name = localizedText(service.name, locale);
  return (
    <Switch
      checked={service.is_active}
      disabled={disabled}
      aria-label={(service.is_active ? toggle.deactivate : toggle.activate).replace("{name}", name)}
      onCheckedChange={(checked) => onToggle(service, checked)}
    />
  );
}
