import type { JSX } from "react";

import { Button } from "@/components/ui/button";
import { useDictionary } from "@/hooks/core/state/use-dictionary";

interface CurrencySwitchProps {
  codes: readonly string[];
  value: string;
  onChange: (code: string) => void;
}

/** Totals are never summed across currencies, so a period with several shows one at a time. */
export function CurrencySwitch({ codes, value, onChange }: CurrencySwitchProps): JSX.Element | null {
  const { earnings: t } = useDictionary();
  if (codes.length < 2) return null;
  return (
    <div role="group" aria-label={t.currency.label} className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">{t.currency.label}</span>
      {codes.map((code) => (
        <Button key={code} type="button" size="sm" variant={code === value ? "default" : "outline"} aria-pressed={code === value} onClick={() => onChange(code)}>
          {code}
        </Button>
      ))}
    </div>
  );
}
