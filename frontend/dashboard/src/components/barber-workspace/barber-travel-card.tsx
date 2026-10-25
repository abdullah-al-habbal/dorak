interface IBarberTravelCardProps {
  title: string;
  travelRadius: number | null | undefined;
  unavailableLabel: string;
}

export function BarberTravelCard({
  title,
  travelRadius,
  unavailableLabel,
}: IBarberTravelCardProps) {
  return (
    <section className="rounded-xl border border-border-primary bg-card-primary p-5">
      <h2 className="font-semibold text-title-50">{title}</h2>
      <p className="mt-2 text-sm text-text-secondary">
        {travelRadius ?? unavailableLabel}
      </p>
    </section>
  );
}
