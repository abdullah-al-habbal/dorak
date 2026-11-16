"use client";

import { Trash2Icon } from "lucide-react";
import { useState } from "react";
import type { ChangeEvent, JSX } from "react";

import { FormField, fieldErrorId } from "@/components/common/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UPLOAD_IMAGE_ACCEPT } from "@/config/upload.constant";
import { useRemoveCatalogItemMedia, useUploadCatalogItemMedia } from "@/hooks/services/catalog/use-catalog-item-media";
import { useI18n } from "@/hooks/core/state/use-i18n";
import { imageFileIssue } from "@/lib/uploads/image-file.util";
import type { CatalogMedium } from "@/types/services/catalog-item.type";

interface CatalogItemMediaSectionProps {
  itemId: string;
  initial: readonly CatalogMedium[];
}

/** The images of a saved item: add one at a time, remove with a button. Each change is saved at once. */
export function CatalogItemMediaSection({ itemId, initial }: CatalogItemMediaSectionProps): JSX.Element {
  const { dictionary } = useI18n();
  const t = dictionary.adminCatalog.items.media;
  const upload = useUploadCatalogItemMedia();
  const remove = useRemoveCatalogItemMedia();
  const [media, setMedia] = useState<readonly CatalogMedium[]>(initial);
  const [error, setError] = useState<string>();
  const busy = upload.isPending || remove.isPending;

  async function pick(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;
    const issue = imageFileIssue(file);
    setError(issue === undefined ? undefined : t.issues[issue]);
    if (issue === undefined) setMedia([...media, await upload.mutateAsync({ itemId, file }).catch(() => null)].filter((medium): medium is CatalogMedium => medium !== null));
    input.value = "";
  }

  async function drop(mediaId: string): Promise<void> {
    await remove.mutateAsync({ itemId, mediaId }).then(() => setMedia(media.filter((medium) => medium.id !== mediaId))).catch(() => undefined);
  }

  return (
    <fieldset className="flex flex-col gap-3 rounded-xl border border-border p-4">
      <legend className="px-1 text-sm font-medium">{t.title}</legend>
      {media.length === 0 ? <p className="text-sm text-muted-foreground">{t.empty}</p> : null}
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {media.map((medium) => (
          <li key={medium.id} className="relative overflow-hidden rounded-lg border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element -- the file lives on the API's public disk, not in the Next image pipeline */}
            <img src={medium.image_url} alt={medium.alt_text ?? ""} loading="lazy" className="aspect-square w-full object-cover" />
            <Button type="button" size="icon" variant="secondary" className="absolute end-1 top-1" aria-label={t.remove} disabled={busy} onClick={() => drop(medium.id)}>
              <Trash2Icon aria-hidden />
            </Button>
          </li>
        ))}
      </ul>
      <FormField id="item-media" label={t.add} hint={t.hint} error={error}>
        <Input id="item-media" type="file" aria-invalid={error !== undefined} aria-describedby={error ? fieldErrorId("item-media") : undefined} accept={UPLOAD_IMAGE_ACCEPT} disabled={busy} onChange={pick} />
      </FormField>
    </fieldset>
  );
}
