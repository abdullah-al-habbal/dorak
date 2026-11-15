"use client";

import { DownloadIcon } from "lucide-react";
import type { JSX } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useDictionary } from "@/hooks/use-dictionary";
import { earningsCsv, earningsFilename } from "@/lib/earnings-csv.util";
import type { Earnings } from "@/types/earnings/earnings.type";
import type { EarningsRange } from "@/types/earnings/earnings-range.type";

interface EarningsExportButtonProps {
  earnings: Earnings | undefined;
  range: EarningsRange;
}

function download(filename: string, text: string): void {
  const url = URL.createObjectURL(new Blob([text], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/** Exports every day and currency of the period; disabled until there is something to export. */
export function EarningsExportButton({ earnings, range }: EarningsExportButtonProps): JSX.Element {
  const { earnings: t } = useDictionary();
  const empty = !earnings || earnings.series.length === 0;
  const exportCsv = (): void => {
    if (!earnings) return;
    download(earningsFilename(range), earningsCsv(earnings, t.export));
    toast.success(t.export.done);
  };

  return (
    <Button type="button" variant="outline" disabled={empty} onClick={exportCsv}>
      <DownloadIcon aria-hidden data-icon="inline-start" />
      {t.export.action}
    </Button>
  );
}
