"use client";

import { Button } from "@/components/tailgrids/core/button";

interface IBarberWorkstationCardProps {
  title: string;
  onlineLabel: string;
  offlineLabel: string;
  goOnlineLabel: string;
  goOfflineLabel: string;
  online: boolean;
  isPending: boolean;
  onToggle: () => void;
}

export function BarberWorkstationCard({
  title,
  onlineLabel,
  offlineLabel,
  goOnlineLabel,
  goOfflineLabel,
  online,
  isPending,
  onToggle,
}: IBarberWorkstationCardProps) {
  return (
    <section className="rounded-xl border border-border-primary bg-card-primary p-5">
      <h2 className="font-semibold text-title-50">{title}</h2>
      <p className="mt-2 text-sm text-text-secondary">
        {online ? onlineLabel : offlineLabel}
      </p>
      <Button className="mt-4" isDisabled={isPending} onPress={onToggle}>
        {online ? goOfflineLabel : goOnlineLabel}
      </Button>
    </section>
  );
}
