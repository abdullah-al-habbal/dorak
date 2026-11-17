import type { JSX } from "react";

import { bodyPreview, parseBodyObject } from "@/lib/platform/website-content.util";

interface SectionBodyPreviewProps {
  label: string;
  emptyLabel: string;
  bodyEn: string;
  bodyAr: string;
}

/** The headline of each language's body JSON as the public page would show it; invalid JSON previews as empty. */
export function SectionBodyPreview({ label, emptyLabel, bodyEn, bodyAr }: SectionBodyPreviewProps): JSX.Element {
  const previews = [
    { dir: "ltr", body: parseBodyObject(bodyEn) },
    { dir: "rtl", body: parseBodyObject(bodyAr) },
  ] as const;
  return (
    <section aria-label={label} className="grid grid-cols-1 gap-3 rounded-xl border border-dashed border-border p-3 sm:grid-cols-2">
      {previews.map(({ dir, body }) => {
        const preview = body ? bodyPreview(body) : { heading: "", subheading: "" };
        return (
          <div key={dir} dir={dir} className="flex flex-col gap-1">
            <span className="text-lg font-semibold">{preview.heading || emptyLabel}</span>
            {preview.subheading ? <span className="text-sm text-muted-foreground">{preview.subheading}</span> : null}
          </div>
        );
      })}
    </section>
  );
}
