import Image from "next/image";

interface IBarberPortfolioCardProps {
  title: string;
  noPortfolioLabel: string;
  photos: readonly { id: string; url: string }[] | undefined;
}

export function BarberPortfolioCard({
  title,
  noPortfolioLabel,
  photos,
}: IBarberPortfolioCardProps) {
  return (
    <section className="rounded-xl border border-border-primary bg-card-primary p-5">
      <h2 className="font-semibold text-title-50">{title}</h2>
      {photos?.length ? (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {photos.map((photo) => (
            <div
              className="relative aspect-square overflow-hidden rounded-md"
              key={photo.id}
            >
              <Image
                alt={title}
                className="object-cover"
                fill
                sizes="(min-width: 1024px) 33vw, 33vw"
                src={photo.url}
                unoptimized
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-text-secondary">{noPortfolioLabel}</p>
      )}
    </section>
  );
}
