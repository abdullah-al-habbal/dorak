import type { JSX } from "react";

/** Portfolio photos; they carry no caption, so the alt text is the stylist's name and the number. */
export function PortfolioGrid({ photos, label }: { photos: readonly { url: string }[]; label: string }): JSX.Element {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {photos.map((photo, index) => (
        <li key={photo.url}>
          {/* eslint-disable-next-line @next/next/no-img-element -- the file lives on the API's public disk, not in the Next image pipeline */}
          <img src={photo.url} alt={`${label} ${index + 1}`} loading="lazy" width={320} height={320} className="aspect-square w-full rounded-xl bg-muted object-cover" />
        </li>
      ))}
    </ul>
  );
}
