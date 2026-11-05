"use client";

import { Button } from "@/components/tailgrids/core/button";
import Image from "next/image";
import type { ChangeEvent } from "react";

interface IBarberPortfolioCardProps {
  title: string;
  noPortfolioLabel: string;
  uploadLabel: string;
  deleteLabel: string;
  photos: readonly { id: string; url: string }[] | undefined;
  isUploading: boolean;
  onUpload: (file: File) => void;
  onDelete: (id: string) => void;
}

export function BarberPortfolioCard({
  title,
  noPortfolioLabel,
  uploadLabel,
  deleteLabel,
  photos,
  isUploading,
  onUpload,
  onDelete,
}: IBarberPortfolioCardProps) {
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) onUpload(file);
  };

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
              <Button
                className="absolute right-1 top-1"
                size="xs"
                variant="danger"
                appearance="fill"
                onPress={() => onDelete(photo.id)}
              >
                {deleteLabel}
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-text-secondary">{noPortfolioLabel}</p>
      )}
      <label className="mt-3 inline-block cursor-pointer text-sm text-primary-500">
        <input
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          disabled={isUploading}
          onChange={handleFileChange}
          type="file"
        />
        {uploadLabel}
      </label>
    </section>
  );
}
